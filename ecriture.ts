class ecriture {
    nom : string;
    date : Date;
    montant : number;
    account_id : number;

    constructor(nom : string, date : Date, montant : number, account_id : number) {
        this.nom = nom;
        this.date = date;
        this.montant = montant;
        this.account_id = account_id;
    }

    public toString() : string {
        return "<p>"+this.date.toLocaleDateString('fr-FR')+" "+this.nom+ " "+this.montant.toFixed(2)+"</p>";
    }
}
