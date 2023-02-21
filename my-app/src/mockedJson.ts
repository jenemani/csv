//Format of data:
// - if data has headers, then Map<string, array<string>>
// - if data does not have headers, then array<array<string>>

const headerData: {[key: string]: string[]} = {
	"id": ["1", "2", "3", "4", "5"],
	"city": ["Providence", "Boston", "Dallas", "Los Angeles", "San Francisco"],
	"state": ["RI", "MA", "TX", "CA", "CA"]
};

const noHeaderData: Array<Array<string>> = [
	["1", "2", "3", "4", "5"],
	["Providence", "Boston", "Dallas", "Los Angeles", "San Francisco"],
	["RI", "MA", "TX", "CA", "CA"]
];

const emptyHeaders: {[key: string]: string[]} = {};

const emptyHeadersWithKey: {[key: string]: string[]} = {
	"a": []
};

const emptyNoHeaders: Array<Array<string>> = [];

const emptyNoHeadersWithArr: Array<Array<string>> = [[]];

const headerSearch: {[key: string]: Array<Array<string>>} = {
	"id 2": [["2", "Boston", "MA"]],
	"state CA": [["4", "Los Angeles", "CA"], ["5", "San Francisco", "CA"]],
	"state ca": [],
	"id 10": []
};

const noHeaderSearch: {[key: string]: Array<Array<string>>} = {
    "0 1": [["1", "Providence", "RI"]],
    "1 Providence": [["1", "Providence", "RI"]],
    "2 RI": [["1", "Providence", "RI"]],
    "0 2": [["2", "Boston", "MA"]],
    "1 Boston": [["2", "Boston", "MA"]],
    "2 MA": [["2", "Boston", "MA"]],
    "0 3": [["1", "Providence", "RI"]],
    "1 Dallas": [["1", "Providence", "RI"]],
    "2 TX": [["1", "Providence", "RI"]],
    "0 4": [["1", "Providence", "RI"]],
    "1 Los Angeles": [["1", "Providence", "RI"]],
    "2 CA": [["4", "Los Angeles", "CA"], ["5", "San Francisco", "CA"],],
    "0 5": [["5", "San Francisco", "CA"]],
    "1 San Fransisco": [["5", "San Francisco", "CA"]],
};

const emptyHeaderKeySearch: {[key: string]: Array<Array<string>>} = {
	"a hi": [],
	"a Hi": [],
	"a 31": []
};

const emptyNoHeaderSearch: {[key: string]: Array<Array<string>>} = {
	"0 hi": [],
	"0 Hi": [],
	"0 31": []
};


const dataMap: {[key: string]: {[key: string]: string[]} | Array<Array<string>>} = {
	"data/headerData.csv": headerData,
	"data/noHeaderData.csv": noHeaderData,
	"data/emptyHeader.csv": emptyHeaders,
	"data/emptyHeaderKeys.csv": emptyHeadersWithKey,
	"data/emptyNoHeader.csv": emptyNoHeaders,
	"data/emptyNoHeaderArr.csv": emptyNoHeadersWithArr
};

const searchMap: {[key: string]: {[key: string]: Array<Array<string>>}} = {
	"data/headerData.csv": headerSearch,
	"data/noHeaderData.csv": noHeaderSearch,
	"data/emptyHeaderKeys.csv": emptyHeaderKeySearch,
	"data/emptyNoHeaderArr.csv": emptyNoHeaderSearch
};

export { dataMap, searchMap };
