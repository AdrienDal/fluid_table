/*
* Classe représentant un groupe
*
 */
class bank {

    static bank_actuel : Array<any> = [];

    name: string;
    logo : string;
    groupe_id : string;
    fils : Array<any>;
    open : string;
    rotate : string;

    constructor(name: string,logo : string,groupe_id : string) {
        this.name = name;
        this.logo = logo;
        this.groupe_id = groupe_id;
        this.fils = [];
        this.open = "";
        this.rotate = "";
    }


    public getTotal(from : Date, to : Date): number {
        let m = 0;
        for (let i = 0; i < this.fils.length; i++ ){
            m += this.fils[i].getTotal(from, to);
        }
        return m;
    }

    public toString() : string {
        let div =  "<div class='div_compte compte "+this.open+" "+this.rotate+"' tag='"+this.groupe_id+"'><img src='img/"+this.logo+".png' /> "  + this.name + "</div>";
        this.open = "";
        this.rotate = "";
        return div;
    }

    /*
    * Retourne une instance bank par rapport à son groupe_id
     */
    static get(groupe_id : any, tmp_bank : bank) : bank {
        if (groupe_id.length > 1) {
            for (let i = 1; i < groupe_id.length; i++) {
                tmp_bank = tmp_bank.fils[(groupe_id[i] - 1)];
            }
        }
        return tmp_bank;
    }

    public afficheFils(div : any) {
        if (this.fils.length > 0) {
            div.addClass('open');
            div.addClass('rotate');
            let bank_actuel_tmp = [];
            let liste_td = "<div class='compte'>";

            for (let i = 0; i < bank.bank_actuel.length; i++) {
                if (bank.bank_actuel[i].groupe_id != this.groupe_id) {
                    bank_actuel_tmp.push(bank.bank_actuel[i]);
                }
                else {
                    for (let i = 0; i < this.fils.length; i++) {
                        liste_td += "<div class='row'>" + this.fils[i].toString() + "</div>";
                        bank_actuel_tmp.push(this.fils[i]);
                    }
                    liste_td += "</div>";
                }
            }

            bank.bank_actuel = bank_actuel_tmp;
            div.after(liste_td);
        }
    }

    public removeFils(div : any) {
        div.nextAll("div").remove();
        div.removeClass('open');
        let bank_actuel_tmp = [];
        let replace = true;
        for (let i = 0; i <bank.bank_actuel.length; i++) {
            if (!bank.bank_actuel[i].groupe_id.toString().startsWith(this.groupe_id)) {
                bank_actuel_tmp.push(bank.bank_actuel[i]);
            }else if (replace) {
                bank_actuel_tmp.push(this);
                replace = false;
            }
        }
        bank.bank_actuel = bank_actuel_tmp;
    }


    public setAccountToGroupes(tabComptes) {
        for (let i = 0; i < this.fils.length; i++ ){
            this.fils[i].setAccountToGroupes(tabComptes);
        }
        for (let y = 0; y < tabComptes.length; y++ ){
            if (this.groupe_id == tabComptes[y].groupe_id.substr(0,tabComptes[y].groupe_id.length-1)) {
                this.fils.push(tabComptes[y]);
            }
        };
        return this;
    }

    static init(groupes) : bank  {

        let getFils = (x : any, b : bank) :bank => {
            if (typeof(x.Group) != "undefined" || (Array.isArray(x))){ //test si x.Group existe ou si c'est un tableau
                if (Array.isArray(x)) {
                    for (let i = 0; i < x.length ; i++) { //si c'est un tableau, boucle sur chaque entrée
                        if (typeof (x[i].Group) != "undefined" ) {
                            b.fils.push(getFils(x[i].Group, new bank(x[i].caption, "groupe", x[i].groupId))); //si le fils contient un group, appeler getFils
                        }else {
                            b.fils.push(new bank(x[i].caption, "groupe", x[i].groupId)); //sinon c'est une feuille donc new bank  et fin de la fonction (return b)
                        }
                    }
                } else {
                    b.fils.push(getFils(x.Group, new bank(x.caption, "groupe", x.groupId))); //si x n'est pas un array => il est l'unique fils, pas besoin de boucle
                }
                return b;
            }else {
                return new bank(x.caption, "groupe", x.groupId); // si x.group est undefined => pas de fils donc feuille
            }
        }

        let tmp_bank = new bank(groupes.Group.caption, "groupe", groupes.Group.groupId);
        tmp_bank = getFils(groupes.Group.Group,tmp_bank);
        return tmp_bank;
    }
}
