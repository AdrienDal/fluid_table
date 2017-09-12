var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ecriture = (function () {
    function ecriture(nom, date, montant, account_id) {
        this.nom = nom;
        this.date = date;
        this.montant = montant;
        this.account_id = account_id;
    }
    ecriture.prototype.toString = function () {
        return "<p>" + this.date.toLocaleDateString('fr-FR') + " " + this.nom + " " + this.montant.toFixed(2) + "</p>";
    };
    return ecriture;
}());
var bank = (function () {
    function bank(name, logo, groupe_id) {
        this.name = name;
        this.logo = logo;
        this.groupe_id = groupe_id;
        this.fils = [];
        this.open = "";
        this.rotate = "";
    }
    bank.prototype.getTotal = function (from, to) {
        var m = 0;
        for (var i = 0; i < this.fils.length; i++) {
            m += this.fils[i].getTotal(from, to);
        }
        return m;
    };
    bank.prototype.getListeEcritures = function (from, to) {
        var e = "";
        for (var i = 0; i < this.fils.length; i++) {
            e += this.fils[i].getListeEcritures(from, to);
        }
        return e;
    };
    bank.prototype.toString = function () {
        var div = "<div class='div_compte compte " + this.open + " " + this.rotate + "' tag='" + this.groupe_id + "'><img src='img/" + this.logo + ".png' /><br />" + this.name + "</div>";
        this.open = "";
        this.rotate = "";
        return div;
    };
    bank.get = function (groupe_id, tmp_bank) {
        if (groupe_id.length > 1) {
            for (var i = 1; i < groupe_id.length; i++) {
                tmp_bank = tmp_bank.fils[(groupe_id[i] - 1)];
            }
        }
        return tmp_bank;
    };
    bank.prototype.afficheFils = function (div) {
        if (this.fils.length > 0) {
            div.addClass('open');
            div.addClass('rotate');
            var bank_actuel_tmp = [];
            var liste_td = "<div class='compte'><div class='container_compte'>";
            for (var i = 0; i < bank.bank_actuel.length; i++) {
                if (bank.bank_actuel[i].groupe_id != this.groupe_id) {
                    bank_actuel_tmp.push(bank.bank_actuel[i]);
                }
                else {
                    for (var i_1 = 0; i_1 < this.fils.length; i_1++) {
                        liste_td += "<div class='row'>" + this.fils[i_1].toString() + "</div>";
                        bank_actuel_tmp.push(this.fils[i_1]);
                    }
                    liste_td += "</div></div>";
                }
            }
            bank.bank_actuel = bank_actuel_tmp;
            div.after(liste_td);
        }
    };
    bank.prototype.removeFils = function (div) {
        div.nextAll("div").remove();
        div.removeClass('open');
        var bank_actuel_tmp = [];
        var replace = true;
        for (var i = 0; i < bank.bank_actuel.length; i++) {
            if (!bank.bank_actuel[i].groupe_id.toString().startsWith(this.groupe_id)) {
                bank_actuel_tmp.push(bank.bank_actuel[i]);
            }
            else if (replace) {
                bank_actuel_tmp.push(this);
                replace = false;
            }
        }
        bank.bank_actuel = bank_actuel_tmp;
    };
    bank.prototype.setAccountToGroupes = function (tabComptes) {
        for (var i = 0; i < this.fils.length; i++) {
            this.fils[i].setAccountToGroupes(tabComptes);
        }
        for (var y = 0; y < tabComptes.length; y++) {
            if (this.groupe_id == tabComptes[y].groupe_id.substr(0, tabComptes[y].groupe_id.length - 1)) {
                this.fils.push(tabComptes[y]);
            }
        }
        ;
        return this;
    };
    bank.init = function (groupes) {
        var getFils = function (x, b) {
            if (typeof (x.Group) != "undefined" || (Array.isArray(x))) {
                if (Array.isArray(x)) {
                    for (var i = 0; i < x.length; i++) {
                        if (typeof (x[i].Group) != "undefined") {
                            b.fils.push(getFils(x[i].Group, new bank(x[i].caption, "groupe", x[i].groupId)));
                        }
                        else {
                            b.fils.push(new bank(x[i].caption, "groupe", x[i].groupId));
                        }
                    }
                }
                else {
                    b.fils.push(getFils(x.Group, new bank(x.caption, "groupe", x.groupId)));
                }
                return b;
            }
            else {
                return new bank(x.caption, "groupe", x.groupId);
            }
        };
        var tmp_bank = new bank(groupes.Group.caption, "groupe", groupes.Group.groupId);
        tmp_bank = getFils(groupes.Group.Group, tmp_bank);
        return tmp_bank;
    };
    bank.bank_actuel = [];
    return bank;
}());
var account = (function (_super) {
    __extends(account, _super);
    function account(name, logo, groupe_id, account_id) {
        _super.call(this, name, logo, groupe_id);
        this.account_id = account_id;
        this.ecritures = [];
    }
    account.prototype.getTotal = function (from, to) {
        var m = 0;
        for (var i = 0; i < this.ecritures.length; i++) {
            if (this.ecritures[i].date >= from && this.ecritures[i].date <= to)
                m += this.ecritures[i].montant;
        }
        return m;
    };
    account.prototype.getListeEcritures = function (from, to) {
        var e = "<ul>";
        for (var i = 0; i < this.ecritures.length; i++) {
            if (this.ecritures[i].date >= from && this.ecritures[i].date <= to)
                e += "<li>" + this.ecritures[i].toString() + "</li>";
        }
        e += "</ul>";
        return e;
    };
    account.prototype.toString = function () {
        return "<div class='div_compte compte account' tag='" + this.groupe_id + "'><img src='img/" + this.logo + ".png' /><br />" + this.name + "</div>";
    };
    return account;
}(bank));
var calendrier = (function () {
    function calendrier(name, from, to, cal_id) {
        this.name = name;
        this.from = from;
        this.to = to;
        this.cal_id = cal_id;
        this.fils = [];
        this.open = "";
        this.colspan = "";
    }
    calendrier.prototype.toString = function () {
        var div = "<div class='div_cal cal" + this.open + "' tag='" + this.cal_id + "' >" + this.name + "</div>";
        this.open = "";
        this.colspan = "";
        return div;
    };
    calendrier.get = function (cal_id, tmp_cal) {
        if (cal_id.length > 1) {
            for (var i = 1; i < cal_id.length; i++) {
                tmp_cal = tmp_cal.fils[(cal_id[i])];
            }
        }
        return tmp_cal;
    };
    calendrier.prototype.afficheFils = function (div) {
        if (this.fils.length > 0) {
            div.addClass('open');
            var cal_actuel_tmp = [];
            var liste_div = "<div class='container_cal'><div class='row'>";
            for (var i = 0; i < calendrier.cal_actuel.length; i++) {
                if (calendrier.cal_actuel[i].cal_id != this.cal_id) {
                    cal_actuel_tmp.push(calendrier.cal_actuel[i]);
                }
                else {
                    for (var i_2 = 0; i_2 < this.fils.length; i_2++) {
                        liste_div += this.fils[i_2].toString();
                        cal_actuel_tmp.push(this.fils[i_2]);
                    }
                }
            }
            liste_div += "</div></div>";
            calendrier.cal_actuel = cal_actuel_tmp;
            div.append(liste_div);
        }
    };
    calendrier.prototype.removeFils = function (div) {
        div.children().remove();
        div.removeClass('open');
        var cal_actuel_tmp = [];
        var replace = true;
        for (var i = 0; i < calendrier.cal_actuel.length; i++) {
            if (!calendrier.cal_actuel[i].cal_id.startsWith(this.cal_id)) {
                cal_actuel_tmp.push(calendrier.cal_actuel[i]);
            }
            else if (replace) {
                cal_actuel_tmp.push(this);
                replace = false;
            }
        }
        calendrier.cal_actuel = cal_actuel_tmp;
    };
    calendrier.init = function (data) {
        var getFils = function (x, b) {
            if (typeof (x.TimeAggregate) != "undefined" || (Array.isArray(x))) {
                if (Array.isArray(x)) {
                    for (var i = 0; i < x.length; i++) {
                        if (typeof (x[i].TimeAggregate) != "undefined") {
                            b.fils.push(getFils(x[i].TimeAggregate, new calendrier(x[i].caption, new Date(x[i].timeFrom), new Date(x[i].timeTo), '' + b.cal_id + i)));
                        }
                        else {
                            b.fils.push(new calendrier(x[i].caption, new Date(x[i].timeFrom), new Date(x[i].timeTo), '' + b.cal_id + i));
                        }
                    }
                }
                else {
                    b.fils.push(getFils(x.TimeAggregate, new calendrier(x.caption, new Date(x.timeFrom), new Date(x.timeTo), '' + b.cal_id + 0)));
                }
                return b;
            }
            else {
                return new calendrier(x.caption, new Date(x.timeFrom), new Date(x.timeTo), '' + b.cal_id + 0);
            }
        };
        var i_annee = 0;
        var tmp_cal = new calendrier(data.TimeAggregate.caption, new Date(data.TimeAggregate.timeFrom), new Date(data.TimeAggregate.timeTo), '0');
        tmp_cal = getFils(data.TimeAggregate.TimeAggregate, tmp_cal);
        return tmp_cal;
    };
    calendrier.cal_actuel = [];
    return calendrier;
}());
var fluid_table = function (options) {
    var defauts = {
        "base_div": $("#fluid_table"),
        "width": 1400,
        "height": 750,
        'data_calendrier': 'json/Calendrier.json',
        'data_ecritures': 'json/Ecritures.json',
        'data_groupes': 'json/Groupes.json',
        'data_comptes': 'json/Comptes.json'
    };
    var parametres = $.extend(defauts, options);
    var cal;
    var banko;
    var tabComptes = [];
    var tabEcritures = [];
    var on_mouve = false;
    var ecriture_on_mouve = false;
    var base_l = 0;
    var centre_l = 0;
    var base_h = 0;
    var centre_t = 0;
    var tmplatebase = "<div id='content'>" +
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
        "</div>" +
        "<div id='bas_droite'>" +
        "<div id='table_montant'></div>" +
        "</div>" +
        "</div>" +
        "<div id='ecriture'>" +
        "<img src='img/croix.png' id='close_ecriture'/>" +
        "<div id='titre_ecriture'></div>" +
        "<div id='liste_ecriture'></div>" +
        "</div>";
    $.when($.getJSON(parametres.data_calendrier, function (data) {
        cal = calendrier.init(data);
    }), $.getJSON(parametres.data_ecritures, function (data) {
        $(data.Entry).each(function () {
            tabEcritures.push(new ecriture(this.caption, new Date(this.date), this.amount, this.accountId));
        });
    }), $.getJSON(parametres.data_comptes, function (data) {
        var ascii = 65;
        $(data.Account).each(function () {
            if (ascii > 89) {
                ascii = 65;
            }
            tabComptes.push(new account(this.caption, "compte", this.groupId + String.fromCharCode(ascii++), this.accountId));
        });
    }), $.getJSON(parametres.data_groupes, function (data) {
        banko = bank.init(data);
    })).then(function () {
        for (var i = 0; i < tabEcritures.length; i++) {
            for (var y = 0; y < tabComptes.length; y++) {
                if (tabEcritures[i].account_id == tabComptes[y].account_id) {
                    tabComptes[y].ecritures.push(tabEcritures[i]);
                }
            }
        }
        banko.setAccountToGroupes(tabComptes);
        init_affichage();
    });
    var init_affichage = function () {
        parametres.base_div.html(tmplatebase);
        $("#content").css('width', parametres.width + 'px');
        $("#content").css('height', parametres.height + 'px');
        base_l = $('#bas_droite').offset().left;
        centre_l = base_l + ($('#bas_droite').width() / 3);
        base_h = $('#bas_droite').offset().top;
        centre_t = $('#bas_droite').offset().top + ($('#bas_droite').height() / 3);
        $("#ecriture").css('left', centre_l + 200 + 'px').css('top', centre_t + "px");
        $("#table_cal").html("<div class='row'>" + cal.toString() + "</div>");
        $("#table_compte").html("<div class='row'>" + banko.toString() + "</div>");
        calendrier.cal_actuel = [cal];
        bank.bank_actuel = [banko];
        majMontant();
    };
    $(document).on("click", ".div_cal", function (e) {
        if (e.target !== e.currentTarget)
            return;
        $(this).removeClass('mouseover_div');
        var div = $(this);
        var cal_id = div.attr('tag');
        var tmp_cal = calendrier.get(cal_id, cal);
        if (!div.hasClass('open')) {
            tmp_cal.afficheFils(div);
        }
        else {
            tmp_cal.removeFils(div);
        }
        majMontant();
        var l = deplace_l(div);
        deplace(0, l);
    });
    $(document).on("click", ".div_compte", function (e) {
        if (e.target !== e.currentTarget)
            return;
        $(this).removeClass('mouseover_div');
        var div = $(this);
        var groupe_id = div.attr('tag');
        var tmp_banko = bank.get(groupe_id, banko);
        if (!div.hasClass('account')) {
            if (!div.hasClass('open')) {
                tmp_banko.afficheFils(div);
            }
            else {
                tmp_banko.removeFils(div);
            }
        }
        limite_groupe();
        majMontant();
        var h = deplace_t(div);
        deplace(h, 0);
    });
    var limite_groupe = function () {
        var max_groupe_id = 1;
        for (var i = 0; i < bank.bank_actuel.length; i++) {
            (bank.bank_actuel[i].groupe_id.toString().length > max_groupe_id) ? max_groupe_id = bank.bank_actuel[i].groupe_id.toString().length : "";
        }
        $('.div_compte').each(function () {
            $(this).css('display', 'table-cell');
            if (max_groupe_id > 3 && max_groupe_id - $(this).attr('tag').length >= 3) {
                $(this).css('display', 'none');
            }
        });
    };
    var majMontant = function () {
        var liste_div = "";
        for (var x = 0; x < bank.bank_actuel.length; x++) {
            liste_div += "<div class='row'>";
            for (var y = 0; y < calendrier.cal_actuel.length; y++) {
                var total = bank.bank_actuel[x].getTotal(calendrier.cal_actuel[y].from, calendrier.cal_actuel[y].to).toFixed(2);
                var img = (total > 0 ? "<img src='img/ecriture.png' width='50' class='img_ecriture'/>" : "");
                liste_div += "<div class='montant' id='" + x + 'x' + y + "'>" + total + " <br /> " + img + "</div>";
            }
            liste_div += "</div>";
        }
        $("#table_montant").html(liste_div);
    };
    var deplace_l = function (div) {
        var position = div.offset().left;
        if (calendrier.cal_actuel.length > 1) {
            var l = position;
            if (l <= centre_l) {
                l = centre_l - l;
            }
            else {
                l -= centre_l;
                l = l * (-1);
            }
            return l;
        }
        return base_l - position;
    };
    var deplace_t = function (div) {
        var position = div.offset().top;
        if (bank.bank_actuel.length > 1) {
            var h = position;
            if (h <= centre_t) {
                h = centre_t - h;
            }
            else {
                h -= centre_t;
                h = h * (-1);
            }
            return h;
        }
        return base_h - position;
    };
    var deplace = function (h, l) {
        on_mouve = true;
        $("#table_compte").animate({
            top: "+=" + h
        }, 300);
        $("#table_cal").animate({
            left: "+=" + l
        }, 300);
        $("#table_montant").animate({
            top: "+=" + h,
            left: "+=" + l
        }, 300, function () { on_mouve = false; });
    };
    $(document).on('click', '.montant', function (e) {
        var xy = $(this).attr('id');
        var lim = xy.indexOf('x');
        var x = xy.substr(0, lim);
        var y = xy.substr(lim + 1);
        var bank_tmp = bank.bank_actuel[x];
        var cal_tmp = calendrier.cal_actuel[y];
        $(".montant").removeClass('div_montant_ligne_active');
        $(".montant").removeClass('div_montant_active');
        for (var i = 0; i <= bank.bank_actuel.length; i++) {
            $('#' + i + 'x' + y).addClass('div_montant_ligne_active');
        }
        for (var i = 0; i <= calendrier.cal_actuel.length; i++) {
            $('#' + x + 'x' + i).addClass('div_montant_ligne_active');
        }
        $(this).addClass('div_montant_active');
        $(".compte").removeClass('div_compte_active');
        $(".compte").each(function () {
            if ($(this).attr('tag') == bank_tmp.groupe_id) {
                $(this).addClass('div_compte_active');
            }
        });
        $(".cal").removeClass('div_cal_active');
        $(".cal").each(function () {
            if ($(this).attr('tag') == cal_tmp.cal_id) {
                $(this).addClass('div_cal_active');
            }
        });
        if ($("#ecriture").css('display') == 'block') {
            show_ecritures($(this));
        }
        var l = deplace_l($(this));
        var h = deplace_t($(this));
        deplace(h, l);
    });
    $(document).on('wheel', '#content', function (e) {
        if (on_mouve == false) {
            var div_montant_active = $(".div_montant_active");
            var xy = div_montant_active.attr('id');
            var lim = xy.indexOf('x');
            var x = xy.substr(0, lim);
            var y = xy.substr(lim + 1);
            if (e.shiftKey) {
                var div_cal_active = $(".div_cal_active");
                var cal_tmp = calendrier.cal_actuel[y];
                if (e.originalEvent.wheelDelta / 120 > 0) {
                    cal_tmp.afficheFils(div_cal_active);
                }
                else {
                    var div_cal_before = div_cal_active.parent().parent().parent();
                    var cal_tmp_before = calendrier.get(div_cal_before.attr('tag'), cal);
                    cal_tmp_before.removeFils(div_cal_before);
                    y = calendrier.cal_actuel.indexOf(cal_tmp_before);
                }
            }
            else {
                var div_compte_active = $(".div_compte_active");
                var bank_tmp = bank.bank_actuel[x];
                if (e.originalEvent.wheelDelta / 120 > 0) {
                    bank_tmp.afficheFils(div_compte_active);
                }
                else {
                    var div_compte_before = div_compte_active.parent().parent().parent().prev();
                    var bank_tmp_before = bank.get(div_compte_before.attr('tag'), banko);
                    bank_tmp_before.removeFils(div_compte_before);
                    x = bank.bank_actuel.indexOf(bank_tmp_before);
                }
            }
            limite_groupe();
            majMontant();
            $("#" + x + "x" + y).click();
        }
    });
    var show_ecritures = function (div) {
        var xy = div.attr('id');
        var lim = xy.indexOf('x');
        var x = xy.substr(0, lim);
        var y = xy.substr(lim + 1);
        var bank_tmp = bank.bank_actuel[x];
        var cal_tmp = calendrier.cal_actuel[y];
        $("#liste_ecriture").html(bank_tmp.getListeEcritures(cal_tmp.from, cal_tmp.to));
        $("#titre_ecriture").html(cal_tmp.name + " - " + bank_tmp.name);
        $("#ecriture").toggle(true);
    };
    $(document).on('click', '.img_ecriture', function () {
        show_ecritures($(this).parent());
    });
    $(document).on('click', '#close_ecriture', function () {
        $("#ecriture").toggle(500, false);
    });
    $(document).on('mousedown', '#ecriture', function () {
        ecriture_on_mouve = true;
    });
    $(document).on('mouseup', function () {
        ecriture_on_mouve = false;
        $("#ecriture").css('opacity', '1').css('cursor', 'pointer');
    });
    $(document).on('mousemove', function (e) {
        if (ecriture_on_mouve) {
            $("#ecriture").css('left', e.pageX - 125).css('top', e.pageY - 150).css('cursor', 'Move').css('opacity', '0.5');
        }
    });
};
//# sourceMappingURL=main.js.map