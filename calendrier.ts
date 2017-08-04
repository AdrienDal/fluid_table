class calendrier {

    static cal_actuel : Array<any> = [];

    name: string;
    from: Date;
    to: Date;
    cal_id : string;
    fils: Array<any>;
    open : string;
    colspan : string;

    constructor(name: string, from: Date, to: Date, cal_id : string) {
        this.name = name;
        this.from = from;
        this.to = to;
        this.cal_id = cal_id;
        this.fils = [];
        this.open = "";
        this.colspan = "";
    }

    public toString() : string {
        let div =  "<div class='div_cal cal"+this.open+"' tag='"+this.cal_id+"' >"+this.name+"</div>";
        this.open = "";
        this.colspan = "";
        return div;
    }

    public afficheFils() : string {
        let cal_actuel_tmp = [];

        let liste_div = "<div class='row'>";
        for (let i = 0; i <calendrier.cal_actuel.length; i++) {
            if (calendrier.cal_actuel[i].cal_id != this.cal_id) {
                cal_actuel_tmp.push(calendrier.cal_actuel[i]);
            }else {
                for (let i = 0; i < this.fils.length; i++) {
                    liste_div += this.fils[i].toString();
                    cal_actuel_tmp.push(this.fils[i]);
                }
            }
        }
        liste_div += "</div>";
        calendrier.cal_actuel = cal_actuel_tmp;

        return liste_div;
    }

    static get(cal_id : string, tmp_cal : calendrier) : calendrier {
        if (cal_id.length > 1) {
            for (let i = 1; i < cal_id.length; i++) {
                tmp_cal = tmp_cal.fils[(cal_id[i])];
            }
        }
        return tmp_cal;
    }

    static init(data) : calendrier {
        let i_annee = 0;
        let cal = new calendrier(data.TimeAggregate.caption,new Date(data.TimeAggregate.timeFrom),new Date(data.TimeAggregate.timeTo),i_annee+ '');
        let i_trim : number;
        let i_mois : number;
        let i_sema : number;
        i_trim = 0;
        // dfdf
        $(data.TimeAggregate.TimeAggregate).each(function () {
            i_mois = 0;
            cal.fils[i_trim] = new calendrier(this.caption,new Date(this.timeFrom),new Date(this.timeTo), i_annee + '' + i_trim);
            $(this.TimeAggregate).each(function () {
                i_sema = 0;
                cal.fils[i_trim].fils[i_mois] =  new calendrier(this.caption,new Date(this.timeFrom),new Date(this.timeTo), i_annee + '' + i_trim + i_mois);
                if (Array.isArray(this.TimeAggregate)) {
                    $(this.TimeAggregate).each(function () {
                        cal.fils[i_trim].fils[i_mois].fils[i_sema] = new calendrier(this.caption, new Date(this.timeFrom), new Date(this.timeTo),i_annee + '' + i_trim + i_mois + i_sema);
                        i_sema++;
                    });
                }
                i_mois++;
            });
            i_trim++;
        });
        return cal;
    }

}