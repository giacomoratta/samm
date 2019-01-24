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

    constructor(parent){
        this.utils = parent;
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

    dayToTh(day){
    	if(day===1) return '1st';
    	if(day===2) return '2nd';
    	if(day===3) return '3rd';
    	return day+'th';
	}

    monthToName(mt){
        if(!MONTHS_LIST[mt]) return '';
        return MONTHS_LIST[mt].name;
    }

    dateToExtendedString(date){
        /* expected strings similar to yyyy-mm-dd */
        if(_.isNil(date)) date=Date.now();
        let d = new Date(date);
        return d.getDate()+' '+this.monthToName(d.getMonth())+' '+d.getFullYear();
    }

    weekIntervalToString(dt1,dt2,type){
    	let intStr = '';

    	/* type:2  =>  21th May and 3rd June 2019 */
        if(type===2){
            intStr+=this.dayToTh(dt1.getDate());
            if(dt1.getMonth() !== dt2.getMonth()){
                intStr+=' '+this.monthToName(dt1.getMonth());
            }
            intStr+=' and '+this.dayToTh(dt2.getDate());
            intStr+=' '+this.monthToName(dt2.getMonth())+' '+dt2.getFullYear();

        /* type:1  =>  21-28 April 2019 */
        }else{
            intStr+=dt1.getDate();
            intStr+='-'+dt2.getDate();
            intStr+=' '+this.monthToName(dt2.getMonth())+' '+dt2.getFullYear();
        }

        return intStr;
	}

}

module.exports = Utils_Date;
