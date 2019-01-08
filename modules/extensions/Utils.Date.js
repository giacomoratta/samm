const MONTHS_LIST = [
	{
		"abbreviation": "Jan",
		"name": "January"
	},
	{
		"abbreviation": "Feb",
		"name": "February"
	},
	{
		"abbreviation": "Mar",
		"name": "March"
	},
	{
		"abbreviation": "Apr",
		"name": "April"
	},
	{
		"abbreviation": "May",
		"name": "May"
	},
	{
		"abbreviation": "Jun",
		"name": "June"
	},
	{
		"abbreviation": "Jul",
		"name": "July"
	},
	{
		"abbreviation": "Aug",
		"name": "August"
	},
	{
		"abbreviation": "Sep",
		"name": "September"
	},
	{
		"abbreviation": "Oct",
		"name": "October"
	},
	{
		"abbreviation": "Nov",
		"name": "November"
	},
	{
		"abbreviation": "Dec",
		"name": "December"
	}
];


class Utils_Date {

    constructor(){
    }

    dateToStrObj(date){
        if(_.isNil(date)) date=Date.now();
        let dtobj = {};
        let d = new Date(date);

        dtobj.mm = '' + (d.getMonth() + 1);
        if (dtobj.mm.length < 2) dtobj.mm = '0' + dtobj.mm;

        dtobj.dd = '' + d.getDate();
        if (dtobj.dd.length < 2) dtobj.dd = '0' + dtobj.dd;

        dtobj.yyyy = d.getFullYear();

        dtobj.hh = '' + d.getHours();
        if (dtobj.hh.length < 2) dtobj.hh = '0' + dtobj.hh;

        dtobj.ii = '' + d.getMinutes();
        if (dtobj.ii.length < 2) dtobj.ii = '0' + dtobj.ii;

        dtobj.ss = '' + d.getSeconds();
        if (dtobj.ss.length < 2) dtobj.ss = '0' + dtobj.ss;

        return dtobj;
    }


    dateToYYYYMMDD(date) {
        let dtobj = this.dateToStrObj(date);
        return [dtobj.yyyy, dtobj.mm, dtobj.dd].join('');
    }

    dateToYYYYMMDDhhiiss(date) {
        let dtobj = this.dateToStrObj(date);
        return [dtobj.yyyy, dtobj.mm, dtobj.dd, dtobj.hh, dtobj.ii, dtobj.ss].join('');
    }


    monthToName(mt){
        if(!MONTHS_LIST[mt]) return '';
        return MONTHS_LIST[mt].name;
    }

}

module.exports = new Utils_Date();
