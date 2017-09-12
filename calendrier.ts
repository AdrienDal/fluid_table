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

    static get(cal_id : string, tmp_cal : calendrier) : calendrier {
        if (cal_id.length > 1) {
            for (let i = 1; i < cal_id.length; i++) {
                tmp_cal = tmp_cal.fils[(cal_id[i])];
            }
        }
        return tmp_cal;
    }

    public afficheFils(div : any)  {
        if (this.fils.length > 0) {
            div.addClass('open');
            let cal_actuel_tmp = [];

            let liste_div = "<div class='container_cal'><div class='row'>";
            for (let i = 0; i < calendrier.cal_actuel.length; i++) {
                if (calendrier.cal_actuel[i].cal_id != this.cal_id) {
                    cal_actuel_tmp.push(calendrier.cal_actuel[i]);
                } else {
                    for (let i = 0; i < this.fils.length; i++) {
                        liste_div += this.fils[i].toString();
                        cal_actuel_tmp.push(this.fils[i]);
                    }
                }
            }
            liste_div += "</div></div>";
            calendrier.cal_actuel = cal_actuel_tmp;
            div.append(liste_div);
        }
    }

    public removeFils(div : any) {
        div.children().remove();
        div.removeClass('open');
        let cal_actuel_tmp = [];
        let replace = true;
        for (let i = 0; i <calendrier.cal_actuel.length; i++) {
            if (!calendrier.cal_actuel[i].cal_id.startsWith(this.cal_id)) {
                cal_actuel_tmp.push(calendrier.cal_actuel[i]);
            }else if (replace) {
                cal_actuel_tmp.push(this);
                replace = false;
            }
        }
        calendrier.cal_actuel = cal_actuel_tmp;
    }


    static init(data) : calendrier {

        let getFils = (x : any, b : calendrier) :calendrier => {
            if (typeof(x.TimeAggregate) != "undefined" || (Array.isArray(x))){ //test si x.TimeAggregate existe ou si c'est un tableau
                if (Array.isArray(x)) {
                    for (let i = 0; i < x.length ; i++) { //si c'est un tableau, boucle sur chaque entrée
                        if (typeof (x[i].TimeAggregate) != "undefined" ) {
                            b.fils.push(getFils(x[i].TimeAggregate, new calendrier(x[i].caption,new Date(x[i].timeFrom),new Date(x[i].timeTo),''+b.cal_id+i))); //si le fils contient un TimeAggregate, appeler getFils
                        }else {
                            b.fils.push(new calendrier(x[i].caption,new Date(x[i].timeFrom),new Date(x[i].timeTo),''+b.cal_id+i)); //sinon c'est une feuille
                        }
                    }
                } else {
                    b.fils.push(getFils(x.TimeAggregate,new calendrier(x.caption,new Date(x.timeFrom),new Date(x.timeTo),''+b.cal_id+0))); //si x n'est pas un array => il est l'unique fils, pas besoin de boucle
                }
                return b;
            }else {
                return new calendrier(x.caption,new Date(x.timeFrom),new Date(x.timeTo),''+b.cal_id+0);
            }
        }

        let i_annee = 0;
        let tmp_cal = new calendrier(data.TimeAggregate.caption,new Date(data.TimeAggregate.timeFrom),new Date(data.TimeAggregate.timeTo),'0');
        tmp_cal = getFils(data.TimeAggregate.TimeAggregate,tmp_cal);
        return tmp_cal;
    }
}