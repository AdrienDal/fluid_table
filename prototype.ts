let cal;
let banko;

let tabComptes = [];
let tabEcritures = [];

$.when($.getJSON('json/Calendrier.json', (data) => {
    cal = calendrier.init(data);
}),
$.getJSON('json/Ecritures.json', (data) => {
    $(data.Entry).each(function() {
        tabEcritures.push(new ecriture(this.caption, new Date(this.date), this.amount, this.accountId));
    })
}),
$.getJSON('json/Comptes.json', (data) => {
    let ascii = 65;
    $(data.Account).each(function () {
        if (ascii > 89) {
            ascii = 65;
        }
        tabComptes.push(new account(this.caption, "compte", this.groupId+String.fromCharCode(ascii++), this.accountId));
    })
}),
$.getJSON('json/Groupes.json', (data) => {
    banko = bank.init(data);
}),
).then(() => {

    for (let i = 0; i < tabEcritures.length; i++ ){
        for (let y = 0; y < tabComptes.length; y++ ){
            if (tabEcritures[i].account_id == tabComptes[y].account_id) {
                tabComptes[y].ecritures.push(tabEcritures[i]);
            }
        }
    }

    banko.setAccountToGroupes(tabComptes);

    init_affichage();
});


let init_affichage = () => {
        $("#table_cal").append(cal.toString());
        $("#table_compte").append("<div class='row'>"+banko.toString()+"</div>");
        $("#table_montant").append("<div class='montant' id='0x0'>"+banko.getTotal(cal.from, cal.to).toFixed(2)+"</div></div>");

        calendrier.cal_actuel.push(cal);
        bank.bank_actuel.push(banko);
}

$(document).on("click",".div_cal", function(e) {
    if(e.target !== e.currentTarget) return;
    let div = $(this);
    let cal_id = div.attr('tag');
    if (!div.hasClass('open')) {
        let tmp_cal = calendrier.get(cal_id,cal);

        if (tmp_cal.fils.length > 0) {
            div.addClass('open');
            div.append(tmp_cal.afficheFils());
        }
    }else {
       /* let tmp_cal =  cal;
        tmp_cal.open = "open";
        tmp_cal.colspan = "10";
        if (cal_id === "0") {
            calendrier.cal_actuel = [];
            calendrier.cal_actuel.push(tmp_cal);
            tmp_cal.open = "";
        }
        $("#table_cal").html("<table><tr>" + tmp_cal.toString() + "</tr></table>");
        if (cal_id.length > 1) {
            for (let i = 1; i < cal_id.length; i++) {
                if (i < cal_id.length-1 ) {
                    tmp_cal.fils[cal_id[i]].open = "open";
                    tmp_cal.fils[cal_id[i]].colspan = "10";
                    $("#table_cal tbody").append(tmp_cal.fils[cal_id[i]].toString());
                }else {
                    $("#table_cal tbody").append(tmp_cal.afficheFils());
                }
                tmp_cal = tmp_cal.fils[cal_id[i]];
            }
        }*/
    }
    majMontant();
});


$(document).on("click",".div_compte", function (e)  {
    let div = $(this);
    let groupe_id = div.attr('tag');
    if (!div.hasClass('open')) {
        let tmp_banko = bank.get(groupe_id,banko);

        if (tmp_banko.fils.length > 0) {
            div.addClass('open');
         //   div.addClass('rotate');

            div.after(tmp_banko.afficheFils());
        }
    }/*else {
        let tmp_banko = banko;
        tmp_banko.open = "open";
        tmp_banko.rotate = "rotate";
        if (groupe_id == tmp_banko.groupe_id) {
            bank.bank_actuel = [];
            bank.bank_actuel.push(tmp_banko);
            tmp_banko.open = "";
            tmp_banko.rotate = "";
        }
        $("#table_compte").html("<table><tr>" + tmp_banko.toString() + "</tr></table>");
        if (groupe_id.length > 1) {
            for (let i = 1; i < groupe_id.length; i++) {
                if (i < groupe_id.length - 1) {
                    tmp_banko.fils[(groupe_id[i] - 1)].open = "open";
                    tmp_banko.fils[(groupe_id[i] - 1)].rotate = "rotate";
                    $("#table_compte tbody").find("td.open").last().after(tmp_banko.fils[(groupe_id[i] - 1)].toString());
                }
                else {
                    $("#table_compte tbody").find("td.open").last().after(tmp_banko.afficheFils());
                }
                tmp_banko = tmp_banko.fils[(groupe_id[i] - 1)];
            }
        }
    }*/
    majMontant();
});


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

$(document).on('mouseover','.montant' , function() {

    let xy = $(this).attr('id');
    let lim = xy.indexOf('x');
    console.log(lim);
    let x = xy.substr(0,lim);
    let y = xy.substr(lim+1);
    console.log(y);
    let bank_tmp = bank.bank_actuel[x];
    let cal_tmp = calendrier.cal_actuel[y];

    $(".montant").css('background-color' ,'black').css('color','white');

    for (let i = 0; i <= x; i++) {
        $('#'+i+'x'+y).css('background-color' ,"rgb(245,245,"+(i*20)+")").css('color','black');
    }

    for (let i = 0; i <= y; i++) {
        $('#'+x+'x'+i).css('background-color' ,"rgb(245,245,"+(i*20)+")").css('color','black');
    }


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




