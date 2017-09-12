
let fluid_table = (options) => {

    // paramètres par défaut
    let defauts=
        {
            "base_div" : $("#fluid_table"),
            "width" : 1400,
            "height": 750,
            'data_calendrier' : 'json/Calendrier.json',
            'data_ecritures' : 'json/Ecritures.json',
            'data_groupes' : 'json/Groupes.json',
            'data_comptes' : 'json/Comptes.json'
        };
    let parametres=$.extend(defauts, options);

    let cal; // contient le calendrier
    let banko; // contient le plan comptable

    let tabComptes = []; //contient un tableau des comptes chargés
    let tabEcritures = []; //contient un tableau des écritures chargées

    let on_mouve = false;  // le tableau des montants est en mouvement si true
    let ecriture_on_mouve = false; // la fenêtre d'écriture est en mouvement

    let base_l = 0; // initialisation des variables de position
    let centre_l = 0;
    let base_h = 0;
    let centre_t = 0;

    // template
    let tmplatebase = "<div id='content'>" +
                          "<div id='d_droite'></div>" +
                          "<div id='d_gauche'></div>" +
                          "<div id='d_haut'></div>" +
                          "<div id='d_bas'></div>" +
                          "<div id='haut_gauche'>" +
                                "<p>Prototype V4 <br> Compatible Google Chrome uniquement</p>" +
                          "</div>" +
                          "<div id='haut_droite'>" +
                                  "<div id='table_cal'></div>" +
                          "</div>" +
                          "<div id='bas_gauche'>" +
                              "<div id='table_compte'></div>" +
                          "</div>"+
                          "<div id='bas_droite'>" +
                              "<div id='table_montant'></div>" +
                          "</div>" +
                      "</div>"+
                    "<div id='ecriture'>" +
                    "<img src='img/croix.png' id='close_ecriture'/>" +
                    "<div id='titre_ecriture'></div>" +
                    "<div id='liste_ecriture'></div>" +
                    "</div>";

    $.when($.getJSON(parametres.data_calendrier, (data) => {
            cal = calendrier.init(data); //initialiste le calendrier
        }),
        $.getJSON(parametres.data_ecritures, (data) => {
            $(data.Entry).each(function () {
                tabEcritures.push(new ecriture(this.caption , new Date(this.date), this.amount, this.accountId));
            })
        }),
        $.getJSON(parametres.data_comptes, (data) => {
            let ascii = 65;
            $(data.Account).each(function () { //Ajoute un caractère à la fin du groupeId afin de différencier 2 accounts appartenant au même groupe
                if (ascii > 89) {
                    ascii = 65;
                }
                tabComptes.push(new account(this.caption, "compte", this.groupId + String.fromCharCode(ascii++), this.accountId));
            })
        }),
        $.getJSON(parametres.data_groupes, (data) => {
            banko = bank.init(data); //initialiste le plan comptable
        }),
    ).then(() => {
        /*
         * lie les écritures au compte correspondant
         */
        for (let i = 0; i < tabEcritures.length; i++) {
            for (let y = 0; y < tabComptes.length; y++) {
                if (tabEcritures[i].account_id == tabComptes[y].account_id) {
                    tabComptes[y].ecritures.push(tabEcritures[i]);
                }
            }
        }
        banko.setAccountToGroupes(tabComptes); //ajoute les comptes aux différents groupes du plan comptable
        init_affichage();
    });

    /*
     * initialisation de l'affichage avec les informations à la racine du plan comptable et du calendrier
     * Initialisation de la taille du tableau
     */
    let init_affichage = () => {
        parametres.base_div.html(tmplatebase);

        $("#content").css('width',parametres.width +'px');
        $("#content").css('height',parametres.height + 'px');

        base_l = $('#bas_droite').offset().left;
        centre_l = base_l + ($('#bas_droite').width() /3);
        base_h = $('#bas_droite').offset().top;
        centre_t = $('#bas_droite').offset().top + ($('#bas_droite').height() /3);

        $("#ecriture").css('left',centre_l + 200  +'px').css('top',centre_t + "px");

        $("#table_cal").html("<div class='row'>"+cal.toString()+ "</div>");
        $("#table_compte").html("<div class='row'>" + banko.toString() + "</div>");
        calendrier.cal_actuel = [cal];
        bank.bank_actuel = [banko];
        majMontant();
    }

    /*
     * click sur une zone calendrier
     *   -  récupère l'instance avec l'indentifiant inscrit dans le tag de l'élément
     *   -  execute afficheFils ou removeFils en testant si l'élément possède la class open
     */
    $(document).on("click", ".div_cal", function (e) {
        if (e.target !== e.currentTarget) return;
        $(this).removeClass('mouseover_div');
        let div = $(this);
        let cal_id = div.attr('tag');
        let tmp_cal = calendrier.get(cal_id, cal);
        if (!div.hasClass('open')) {
            tmp_cal.afficheFils(div);
        } else {
            tmp_cal.removeFils(div);
        }
        majMontant();
        let l = deplace_l(div);
        deplace(0,l);
    });

    /*
     * click sur une zone calendrier
     *   -  récupère l'instance avec l'indentifiant inscrit dans le tag de l'élément
     *   -  execute afficheFils ou removeFils en testant si l'élément possède la class open
     */
    $(document).on("click", ".div_compte", function (e) {
        if (e.target !== e.currentTarget) return;
        $(this).removeClass('mouseover_div');
        let div = $(this);
        let groupe_id = div.attr('tag');
        let tmp_banko = bank.get(groupe_id, banko);
        if (!div.hasClass('account')) {
            if (!div.hasClass('open')) {
                tmp_banko.afficheFils(div);
            } else {
                tmp_banko.removeFils(div);
            }
        }
        limite_groupe();
        majMontant();
        let h = deplace_t(div);
        deplace(h,0);

    });

    let limite_groupe = () => {
        let max_groupe_id = 1;
        for (let i = 0; i < bank.bank_actuel.length; i++) {
            (bank.bank_actuel[i].groupe_id.toString().length > max_groupe_id) ? max_groupe_id = bank.bank_actuel[i].groupe_id.toString().length : "";
        }

        $('.div_compte').each(function () {
            $(this).css('display', 'table-cell');
            if (max_groupe_id > 3 && max_groupe_id - $(this).attr('tag').length >= 3) {
                $(this).css('display', 'none');
            }
        });
    }

    /*
     * met à jour les différents montants du tableau
     *  chaque div "montant" possède un identifiant sous forme "AxB" A = index de bank_actuel / B = index de cal_actuel (ex => 10x30)
     */
    let majMontant = () => {
        let liste_div = "";
        for (let x = 0; x < bank.bank_actuel.length; x++) {
            liste_div += "<div class='row'>";
            for (let y = 0; y < calendrier.cal_actuel.length; y++) {
                let total = bank.bank_actuel[x].getTotal(calendrier.cal_actuel[y].from, calendrier.cal_actuel[y].to).toFixed(2);
                let img = (total > 0 ? "<img src='img/ecriture.png' width='50' class='img_ecriture'/>" : "");
                liste_div += "<div class='montant' id='" + x + 'x' + y + "'>" + total + " <br /> " +img +"</div>";
            }
            liste_div += "</div>";
        }
        $("#table_montant").html(liste_div);
    }


    /*
    *  Calcul du déplacement horizontal en pixel
     */
    let deplace_l = (div) : number => {
        let position = div.offset().left;
        if (calendrier.cal_actuel.length > 1) {
            let l = position;
            if (l <= centre_l) {
                l = centre_l - l;
            } else {
                l -= centre_l;
                l = l * (-1);
            }
            return l;
        }
        return base_l - position ;
    }

    /*
    * calcul du déplacement vertical en pixel
     */
    let deplace_t = (div) : number =>  {
        let position = div.offset().top;
        if (bank.bank_actuel.length > 1) {
            let h = position;
            if (h <= centre_t) {
                h = centre_t - h;
            } else {
                h -= centre_t;
                h = h * (-1);
            }
            return h;
        }
        return base_h - position;
    }

    /*
    * déplacement des tableaux de compte, montant et calendrier
     */
    let deplace = (h,l) => {
        on_mouve = true;
        $("#table_compte").animate({
            top: "+=" + h
        },300);
        $("#table_cal").animate({
            left: "+=" + l,
        },300);
        $("#table_montant").animate({
            top: "+=" + h,
            left : "+=" + l
        },300,function(){ on_mouve = false; });
    }
    
    /*
     * permet de situer le montant sélectionné
     */
    $(document).on('click', '.montant', function (e) {
        let xy = $(this).attr('id');
        let lim = xy.indexOf('x');
        let x = xy.substr(0, lim);
        let y = xy.substr(lim + 1);

        let bank_tmp = bank.bank_actuel[x];
        let cal_tmp = calendrier.cal_actuel[y];

        $(".montant").removeClass('div_montant_ligne_active');
        $(".montant").removeClass('div_montant_active');

        for (let i = 0; i <=   bank.bank_actuel.length; i++) {
            $('#' + i + 'x' + y).addClass('div_montant_ligne_active');
        }

        for (let i = 0; i <=  calendrier.cal_actuel.length; i++) {
            $('#' + x + 'x' + i).addClass('div_montant_ligne_active');
        }

        $(this).addClass('div_montant_active');

        $(".compte").removeClass('div_compte_active');
        $(".compte").each(function () {
            if ($(this).attr('tag') == bank_tmp.groupe_id) {
                $(this).addClass('div_compte_active');
            }
        })
        $(".cal").removeClass('div_cal_active');
        $(".cal").each(function () {
            if ($(this).attr('tag') == cal_tmp.cal_id) {
                $(this).addClass('div_cal_active');
            }
        })

        if ($("#ecriture").css('display') == 'block') {
            show_ecritures($(this));
        }

        let l = deplace_l($(this));
        let h = deplace_t($(this));
        deplace(h,l);
    });


    /* Gestion de la molette de la souris
    *  Molette haut réduit l'arbre, molette bas l'ouvre
     */
    $(document).on('wheel','#content', function(e) {
        if (on_mouve == false) {
            let div_montant_active = $(".div_montant_active");
            let xy = div_montant_active.attr('id');
            let lim = xy.indexOf('x');
            let x = xy.substr(0, lim);
            let y = xy.substr(lim + 1);

            if (e.shiftKey) { // touche ctrl + molette pour gérer le calendrier
                let div_cal_active = $(".div_cal_active");
                let cal_tmp = calendrier.cal_actuel[y];

                if (e.originalEvent.wheelDelta / 120 > 0) {
                    cal_tmp.afficheFils(div_cal_active);
                } else {
                    let div_cal_before = div_cal_active.parent().parent().parent();
                    let cal_tmp_before = calendrier.get(div_cal_before.attr('tag'), cal);
                    cal_tmp_before.removeFils(div_cal_before);
                    y = calendrier.cal_actuel.indexOf(cal_tmp_before);
                }
            }else {
                let div_compte_active = $(".div_compte_active");
                let bank_tmp = bank.bank_actuel[x];

                if (e.originalEvent.wheelDelta / 120 > 0) {
                    bank_tmp.afficheFils(div_compte_active);
                }  else {
                    let div_compte_before = div_compte_active.parent().parent().parent().prev();
                    let bank_tmp_before = bank.get(div_compte_before.attr('tag'), banko);
                    bank_tmp_before.removeFils(div_compte_before);
                    x = bank.bank_actuel.indexOf(bank_tmp_before);
                }
            }
            limite_groupe();
            majMontant();
            $("#" + x+ "x" + y).click();
        }
    });


    /*
     *  Affichage et fermeture de la fenêtre d'écriture
     */
    let show_ecritures = (div) => {
        let xy = div.attr('id');
        let lim = xy.indexOf('x');
        let x = xy.substr(0, lim);
        let y = xy.substr(lim + 1);
        let bank_tmp = bank.bank_actuel[x];
        let cal_tmp = calendrier.cal_actuel[y];
        $("#liste_ecriture").html(bank_tmp.getListeEcritures(cal_tmp.from, cal_tmp.to));
        $("#titre_ecriture").html(cal_tmp.name+ " - "+ bank_tmp.name);
        $("#ecriture").toggle(true);
    }

    $(document).on('click', '.img_ecriture', function () {
        show_ecritures($(this).parent());
    });

    $(document).on('click','#close_ecriture', () => {
        $("#ecriture").toggle(500,false);
    });

    /*
    * Déplacement de la fenêtre d'écritures
     */
    $(document).on('mousedown','#ecriture',() => {
        ecriture_on_mouve = true;
    });
    $(document).on('mouseup', () => {
        ecriture_on_mouve = false;
        $("#ecriture").css('opacity','1').css('cursor','pointer');
    });
    $(document).on('mousemove', (e) =>{
        if (ecriture_on_mouve) {
            $("#ecriture").css('left', e.pageX-125).css('top', e.pageY-150).css('cursor','Move').css('opacity','0.5');
        }
    });


}




