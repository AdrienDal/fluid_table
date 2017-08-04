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
    bank.prototype.toString = function () {
        var div = "<div class='div_compte compte " + this.open + " " + this.rotate + "' tag='" + this.groupe_id + "'><img src='img/" + this.logo + ".png' /> " + this.name + "</div>";
        this.open = "";
        this.rotate = "";
        return div;
    };
    bank.prototype.afficheFils = function () {
        var bank_actuel_tmp = [];
        var liste_td = "<div class='compte'>";
        for (var i = 0; i < bank.bank_actuel.length; i++) {
            if (bank.bank_actuel[i].groupe_id != this.groupe_id) {
                bank_actuel_tmp.push(bank.bank_actuel[i]);
            }
            else {
                for (var i_1 = 0; i_1 < this.fils.length; i_1++) {
                    liste_td += "<div class='row'>" + this.fils[i_1].toString() + "</div>";
                    bank_actuel_tmp.push(this.fils[i_1]);
                }
                liste_td += "</div>";
            }
        }
        bank.bank_actuel = bank_actuel_tmp;
        return liste_td;
    };
    bank.get = function (groupe_id, tmp_bank) {
        if (groupe_id.length > 1) {
            for (var i = 1; i < groupe_id.length; i++) {
                tmp_bank = tmp_bank.fils[(groupe_id[i] - 1)];
            }
        }
        return tmp_bank;
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
    account.prototype.toString = function () {
        return "<div class='div_compte compte' tag='" + this.groupe_id + "'><img src='img/" + this.logo + ".png' /> " + this.name + "</div>";
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
    calendrier.prototype.afficheFils = function () {
        var cal_actuel_tmp = [];
        var liste_div = "<div class='row'>";
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
        liste_div += "</div>";
        calendrier.cal_actuel = cal_actuel_tmp;
        return liste_div;
    };
    calendrier.get = function (cal_id, tmp_cal) {
        if (cal_id.length > 1) {
            for (var i = 1; i < cal_id.length; i++) {
                tmp_cal = tmp_cal.fils[(cal_id[i])];
            }
        }
        return tmp_cal;
    };
    calendrier.init = function (data) {
        var i_annee = 0;
        var cal = new calendrier(data.TimeAggregate.caption, new Date(data.TimeAggregate.timeFrom), new Date(data.TimeAggregate.timeTo), i_annee + '');
        var i_trim;
        var i_mois;
        var i_sema;
        i_trim = 0;
        $(data.TimeAggregate.TimeAggregate).each(function () {
            i_mois = 0;
            cal.fils[i_trim] = new calendrier(this.caption, new Date(this.timeFrom), new Date(this.timeTo), i_annee + '' + i_trim);
            $(this.TimeAggregate).each(function () {
                i_sema = 0;
                cal.fils[i_trim].fils[i_mois] = new calendrier(this.caption, new Date(this.timeFrom), new Date(this.timeTo), i_annee + '' + i_trim + i_mois);
                if (Array.isArray(this.TimeAggregate)) {
                    $(this.TimeAggregate).each(function () {
                        cal.fils[i_trim].fils[i_mois].fils[i_sema] = new calendrier(this.caption, new Date(this.timeFrom), new Date(this.timeTo), i_annee + '' + i_trim + i_mois + i_sema);
                        i_sema++;
                    });
                }
                i_mois++;
            });
            i_trim++;
        });
        return cal;
    };
    calendrier.cal_actuel = [];
    return calendrier;
}());
var cal;
var banko;
var tabComptes = [];
var tabEcritures = [];
$.when($.getJSON('json/Calendrier.json', function (data) {
    cal = calendrier.init(data);
}), $.getJSON('json/Ecritures.json', function (data) {
    $(data.Entry).each(function () {
        tabEcritures.push(new ecriture(this.caption, new Date(this.date), this.amount, this.accountId));
    });
}), $.getJSON('json/Comptes.json', function (data) {
    var ascii = 65;
    $(data.Account).each(function () {
        if (ascii > 89) {
            ascii = 65;
        }
        tabComptes.push(new account(this.caption, "compte", this.groupId + String.fromCharCode(ascii++), this.accountId));
    });
}), $.getJSON('json/Groupes.json', function (data) {
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
    $("#table_cal").append(cal.toString());
    $("#table_compte").append("<div class='row'>" + banko.toString() + "</div>");
    $("#table_montant").append("<div class='montant' id='0x0'>" + banko.getTotal(cal.from, cal.to).toFixed(2) + "</div></div>");
    calendrier.cal_actuel.push(cal);
    bank.bank_actuel.push(banko);
};
$(document).on("click", ".div_cal", function (e) {
    if (e.target !== e.currentTarget)
        return;
    var div = $(this);
    var cal_id = div.attr('tag');
    if (!div.hasClass('open')) {
        var tmp_cal = calendrier.get(cal_id, cal);
        if (tmp_cal.fils.length > 0) {
            div.addClass('open');
            div.append(tmp_cal.afficheFils());
        }
    }
    else {
    }
    majMontant();
});
$(document).on("click", ".div_compte", function (e) {
    var div = $(this);
    var groupe_id = div.attr('tag');
    if (!div.hasClass('open')) {
        var tmp_banko = bank.get(groupe_id, banko);
        if (tmp_banko.fils.length > 0) {
            div.addClass('open');
            div.after(tmp_banko.afficheFils());
        }
    }
    majMontant();
});
var majMontant = function () {
    var liste_div = "";
    for (var x = 0; x < bank.bank_actuel.length; x++) {
        liste_div += "<div class='row'>";
        for (var y = 0; y < calendrier.cal_actuel.length; y++) {
            liste_div += "<div class='montant' id='" + x + 'x' + y + "'>" + bank.bank_actuel[x].getTotal(calendrier.cal_actuel[y].from, calendrier.cal_actuel[y].to).toFixed(2) + "</div>";
        }
        liste_div += "</div>";
    }
    $("#table_montant").html(liste_div);
};
$(document).on('mouseover', '.montant', function () {
    var xy = $(this).attr('id');
    var lim = xy.indexOf('x');
    console.log(lim);
    var x = xy.substr(0, lim);
    var y = xy.substr(lim + 1);
    console.log(y);
    var bank_tmp = bank.bank_actuel[x];
    var cal_tmp = calendrier.cal_actuel[y];
    $(".montant").css('background-color', 'black').css('color', 'white');
    for (var i = 0; i <= x; i++) {
        $('#' + i + 'x' + y).css('background-color', "rgb(245,245," + (i * 20) + ")").css('color', 'black');
    }
    for (var i = 0; i <= y; i++) {
        $('#' + x + 'x' + i).css('background-color', "rgb(245,245," + (i * 20) + ")").css('color', 'black');
    }
    $(".compte").each(function () {
        $(this).css('background-color', 'black').css('color', 'white');
        if ($(this).attr('tag') == bank_tmp.groupe_id) {
            $(this).css('background-color', 'yellow').css('color', 'black');
        }
    });
    $(".cal").each(function () {
        $(this).css('background-color', 'black').css('color', 'white');
        if ($(this).attr('tag') == cal_tmp.cal_id) {
            $(this).css('background-color', 'yellow').css('color', 'black');
        }
    });
});
//# sourceMappingURL=main.js.map