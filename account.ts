/*
*  Classe account (compte), contenant un identifiant et un taleau d'écritures
*
 */
class account extends bank {
    account_id : number;
    ecritures : Array<any>;

    constructor(name : string, logo : string, groupe_id : string, account_id : number) {
        super(name, logo, groupe_id);
        this.account_id = account_id;
        this.ecritures = [];
    }

    /*
    * Boucle sur le tableau d'écritures et totalise le montants des écritures dont la date se situe entre from et to
     */
    public getTotal(from : Date, to : Date): number {
        let m = 0;
        for (let i = 0; i < this.ecritures.length; i++) {
            if (this.ecritures[i].date >= from && this.ecritures[i].date <= to )
                m += this.ecritures[i].montant;
        }
        return m;
    }

    /*
    * affiche un compte sous forme de div
     */
    public toString() : string {
        return "<div class='div_compte compte' tag='"+this.groupe_id+"'><img src='img/"+this.logo+".png' /> "  + this.name + "</div>"
    }
}
