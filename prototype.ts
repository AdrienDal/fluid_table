let cal; // contient le calendrier
let banko; // contient le plan comptable

let tabComptes = []; //contient un tableau des comptes chargés
let tabEcritures = []; //contient un tableau des écritures chargées

$.when($.getJSON('json/Calendrier.json', (data) => {
    cal = calendrier.init(data); //initialiste le calendrier
}),
$.getJSON('json/Ecritures.json', (data) => {
    $(data.Entry).each(function() {
        tabEcritures.push(new ecriture(this.caption, new Date(this.date), this.amount, this.accountId));
    })
}),
$.getJSON('json/Comptes.json', (data) => {
    let ascii = 65;
    $(data.Account).each(function () { //Ajoute un caractère à la fin du groupeId afin de différencier 2 accounts appartenant au même groupe
        if (ascii > 89) {
            ascii = 65;
        }
        tabComptes.push(new account(this.caption, "compte", this.groupId+String.fromCharCode(ascii++), this.accountId));
    })
}),
$.getJSON('json/Groupes.json', (data) => {
    banko = bank.init(data); //initialiste le plan comptable
}),
).then(() => {

    /*
    * lie les écritures au compte correspondant
     */
    for (let i = 0; i < tabEcritures.length; i++ ){
        for (let y = 0; y < tabComptes.length; y++ ){
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
 */
let init_affichage = () => {
        $("#table_cal").html(cal.toString());
        $("#table_compte").html("<div class='row'>"+banko.toString()+"</div>");
        $("#table_montant").html("<div class='montant' id='0x0'>"+banko.getTotal(cal.from, cal.to).toFixed(2)+"</div></div>");

        calendrier.cal_actuel = [cal];
        bank.bank_actuel = [banko];
}

/*
* click sur une zone calendrier
*   -  récupère l'instance avec l'indentifiant inscrit dans le tag de l'élément
*   -  execute afficheFils ou removeFils en testant si l'élément possède la class open
 */
$(document).on("click",".div_cal", function(e) {
    if(e.target !== e.currentTarget) return;
    let div = $(this);
    let cal_id = div.attr('tag');
    let tmp_cal = calendrier.get(cal_id,cal);
    if (!div.hasClass('open')) {
        tmp_cal.afficheFils(div);
    }else {
        tmp_cal.removeFils(div);
    }
    majMontant();
});

/*
 * click sur une zone calendrier
 *   -  récupère l'instance avec l'indentifiant inscrit dans le tag de l'élément
 *   -  execute afficheFils ou removeFils en testant si l'élément possède la class open
 */
$(document).on("click",".div_compte", function (e)  {
    if(e.target !== e.currentTarget) return;
    let div = $(this);
    let groupe_id = div.attr('tag');
    let tmp_banko = bank.get(groupe_id,banko);
    if (!div.hasClass('open')) {
        tmp_banko.afficheFils(div);
    }else {
        tmp_banko.removeFils(div);
    }
    majMontant();
});

/*
* met à jour les différents montants du tableau
*  chaque div "montant" possède un identifiant sous forme "AxB" A = index de bank_actuel / B = index de cal_actuel (ex => 10x30)
 */
let majMontant = () =>  {
    let liste_div = "";
    for (let x = 0; x < bank.bank_actuel.length; x++) {
        liste_div += "<div class='row'>";
        for (let y = 0; y < calendrier.cal_actuel.length; y++) {
            liste_div += "<div class='montant' id='"+x+'x'+y+"'>"+bank.bank_actuel[x].getTotal(calendrier.cal_actuel[y].from, calendrier.cal_actuel[y].to).toFixed(2)+"</div>";
        }
        liste_div += "</div>";
    }
    $("#table_montant").html(liste_div);
}

/*
* permet de situer le montant sélectionné
 */
$(document).on('mouseover','.montant' , function() {

    let xy = $(this).attr('id');
    let lim = xy.indexOf('x');

    let x = xy.substr(0,lim);
    let y = xy.substr(lim+1);

    let bank_tmp = bank.bank_actuel[x];
    let cal_tmp = calendrier.cal_actuel[y];

    $(".montant").css('background-color' ,'black').css('color','white').css('outline','solid white 1px');

    for (let i = 0; i <= x; i++) {
        $('#'+i+'x'+y).css('background-color' ,"rgb(245,245,"+(i*20)+")").css('color','black');
    }

    for (let i = 0; i <= y; i++) {
        $('#'+x+'x'+i).css('background-color' ,"rgb(245,245,"+(i*20)+")").css('color','black');
    }

    $(this).css('outline','solid red 1px');


    $(".compte").each( function(){
        $(this).css('background-color' ,'black').css('color','white');
        if ($(this).attr('tag') == bank_tmp.groupe_id) {
            $(this).css('background-color' , 'yellow').css('color','black');
        }
    })
    $(".cal").each( function(){
        $(this).css('background-color','black').css('color','white');
        if ($(this).attr('tag') == cal_tmp.cal_id) {
            $(this).css('background-color' , 'yellow').css('color','black');
        }
    })
})




