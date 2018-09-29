/**
 * 一些常用的js工具类
 * xhl 2016-04-03 
 */

/**标准时间转换成可识别时间**/
var format = function (time, format) {
	var t = new Date(time);
	var tf = function (i) {
		return (i < 10 ? '0' : '') + i
	};
	if (time == null) {
		return '';
	} else {
		return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
			switch (a) {
				case 'yyyy':
					return tf(t.getFullYear());
					break;
				case 'MM':
					return tf(t.getMonth() + 1);
					break;
				case 'mm':
					return tf(t.getMinutes());
					break;
				case 'dd':
					return tf(t.getDate());
					break;
				case 'HH':
					return tf(t.getHours());
					break;
				case 'ss':
					return tf(t.getSeconds());
					break;
			}
		})
	}
}
/**时间相差天数**/
var funcdifferdays = function (startTime, endTime) {
	//			var startTime=$("#sellStartDate").val();
	//			var endTime=$("#sellEndDate").val();
	var diffmillis = new Date(endTime).getTime() - new Date(startTime).getTime();
	var differdays = Math.floor(diffmillis / (24 * 3600 * 1000));
	console.log(differdays);
	if (differdays >= 0 && differdays < 7) {
		return true;
	} else {
		alert("导出时间跨度最长不能超过7天或者小于0!");
		return false;
	}
};
//时间戳转可识别时间格式
function toDoubleDigits(number) {
	return number < 10 ? '0' + number : number;
};

function formatDate(timestamp) {
	return timestamp.getFullYear() + "年" + toDoubleDigits(timestamp.getMonth() + 1) + "月" + toDoubleDigits(timestamp.getDate()) + "日";
};

function formatDateTime(timestamp) {
	return formatDate(timestamp) + " " + toDoubleDigits(timestamp.getHours()) + ":" + toDoubleDigits(timestamp.getMinutes()) + ":" + toDoubleDigits(timestamp.getSeconds());
};

function formatDateServer(timestamp) {
	return timestamp.getFullYear() + "-" + toDoubleDigits(timestamp.getMonth() + 1) + "-" + toDoubleDigits(timestamp.getDate());
};

function formatDateTimeServer(timestamp) {
	return formatDateServer(timestamp) + " " + toDoubleDigits(timestamp.getHours()) + ":" + toDoubleDigits(timestamp.getMinutes()) + ":" + toDoubleDigits(timestamp.getSeconds());
};

//标准时间转换时间戳
function datetime_to_unix(datetime) {
	var tmp_datetime = datetime.replace(/:/g, '-');
	tmp_datetime = tmp_datetime.replace(/ /g, '-');
	var arr = tmp_datetime.split("-");
	var now = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
	return parseInt(now.getTime());
}
//时间戳转换成标准时间
function unix_to_datetime(unix) {
	var now = new Date(parseInt(unix) * 1000);
	return now.toLocaleString().replace(/年|月|\//g, "-").replace(/日/g, " ").replace(/上午|下午/g, "");
}
/********获取url里参数**********/
var URL_ARGUMENTS = {};
if (location.search.length) {
	var args = location.search.slice(1).split('&');
	for (var i = 0; i < args.length; i++) {
		var arg = args[i].split('=');
		URL_ARGUMENTS[arg[0]] = arg[1];
	}
}

function GET() {
	if (arguments.length) {
		if (arguments[0] in URL_ARGUMENTS) {
			return URL_ARGUMENTS[arguments[0]];
		} else {
			//throw '"' + arguments[0] + '"参数不存在！';
			return false;
		}
	} else {
		return URL_ARGUMENTS;
	}
}

function addressInit(provinceList, _cmbProvince, _cmbCity, _cmbArea, defaultProvince, defaultCity, defaultArea) {
	var cmbProvince = document.getElementById(_cmbProvince);
	var cmbCity = document.getElementById(_cmbCity);
	var cmbArea = document.getElementById(_cmbArea);

	function cmbSelect(cmb, str) {
		for (var i = 0; i < cmb.options.length; i++) {
			if (cmb.options[i].value == str) {
				cmb.selectedIndex = i;
				return;
			}
		}
	}

	function cmbAddOption(cmb, str, str2, obj) {
		var option = document.createElement("OPTION");
		cmb.options.add(option);
		option.innerHTML = str;
		option.value = str2;
		option.obj = obj;
	}

	function changeCity() {
		cmbArea.options.length = 0;
		if (cmbCity.selectedIndex == -1) return;
		var item = cmbCity.options[cmbCity.selectedIndex].obj;
		for (var i = 0; i < item.option.length; i++) {
			cmbAddOption(cmbArea, item.option[i].optionName, item.option[i].optionId, null);
		}
		cmbSelect(cmbArea, defaultArea);
	}

	function changeProvince() {
		cmbCity.options.length = 0;
		cmbCity.onchange = null;
		if (cmbProvince.selectedIndex == -1) return;
		var item = cmbProvince.options[cmbProvince.selectedIndex].obj;
		for (var i = 0; i < item.play.length; i++) {
			cmbAddOption(cmbCity, item.play[i].playName, item.play[i].playId, item.play[i]);
		}
		cmbSelect(cmbCity, defaultCity);
		changeCity();
		cmbCity.onchange = changeCity;
	}
	provinceList.unshift({
		gameId: '',
		gameName: '请选择',
		play: [{
			playId: '',
			playName: '全部',
			option: [{
				"optionId": '',
				"optionName": "全部"
			}]
		}]
	});
	for (var i = 0; i < provinceList.length; i++) {
		cmbAddOption(cmbProvince, provinceList[i].gameName, provinceList[i].gameId, provinceList[i]);
	}
	cmbSelect(cmbProvince, defaultProvince);
	changeProvince();
	cmbProvince.onchange = changeProvince;
}

function depInit(provinceList, _cmbProvince, _cmbCity, _cmbArea, defaultProvince, defaultCity, defaultArea) {
	var cmbProvince = document.getElementById(_cmbProvince);
	var cmbCity = document.getElementById(_cmbCity);
	var cmbArea = document.getElementById(_cmbArea);

	function cmbSelect(cmb, str) {
		for (var i = 0; i < cmb.options.length; i++) {
			if (cmb.options[i].value == str) {
				cmb.selectedIndex = i;
				return;
			}
		}
	}

	function cmbAddOption(cmb, str, str2, obj) {
		var option = document.createElement("OPTION");
		cmb.options.add(option);
		option.innerHTML = str;
		option.value = str2;
		option.obj = obj;
	}

	function changeCity() {
		cmbArea.options.length = 0;
		if (cmbCity.selectedIndex == -1) return;
		var item = cmbCity.options[cmbCity.selectedIndex].obj;

		for (var i = 0; i < item.post.length; i++) {
			cmbAddOption(cmbArea, item.post[i].postName, item.post[i].postCode, null);
		}
		cmbSelect(cmbArea, defaultArea);
	}

	function changeProvince() {
		cmbCity.options.length = 0;
		cmbCity.onchange = null;
		if (cmbProvince.selectedIndex == -1) return;
		var item = cmbProvince.options[cmbProvince.selectedIndex].obj;
		for (var i = 0; i < item.depart.length; i++) {
			cmbAddOption(cmbCity, item.depart[i].departName, item.depart[i].departCode, item.depart[i]);
		}
		cmbSelect(cmbCity, defaultCity);
		changeCity();
		cmbCity.onchange = changeCity;
	}
	provinceList.unshift({
		comCode: '',
		comName: '请选择',
		depart: [{
			departCode: '',
			departName: '全部',
			post: [{
				"postCode": '',
				"postName": "全部"
			}]
		}]
	});
	for (var i = 0; i < provinceList.length; i++) {
		cmbAddOption(cmbProvince, provinceList[i].comName, provinceList[i].comCode, provinceList[i]);
	}
	cmbSelect(cmbProvince, defaultProvince);
	changeProvince();
	cmbProvince.onchange = changeProvince;
}

/**
 * 时间对象的格式化;
 */
Date.prototype.format = function (format) {
    /*
     * eg:format="yyyy-MM-dd hh:mm:ss";
     */
	var o = {
		"M+": this.getMonth() + 1, // month
		"d+": this.getDate(), // day
		"h+": this.getHours(), // hour
		"m+": this.getMinutes(), // minute
		"s+": this.getSeconds(), // second
		"q+": Math.floor((this.getMonth() + 3) / 3), // quarter
		"S": this.getMilliseconds()
		// millisecond
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4
			- RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1
				? o[k]
				: ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};

if (!Array.prototype.forEach) {

	Array.prototype.forEach = function (callback, thisArg) {
		var T, k;
		if (this == null) {
			throw new TypeError(' this is null or not defined');
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (typeof callback !== "function") {
			throw new TypeError(callback + ' is not a function');
		}
		if (arguments.length > 1) {
			T = thisArg;
		}
		k = 0;
		while (k < len) {
			var kValue;
			if (k in O) {
				kValue = O[k];
				callback.call(T, kValue, k, O);
			}
			k++;
		}
	};
}

//判断操作系统
var isMac = function () { return /macintosh|mac os x/i.test(navigator.userAgent); }();
var isWindows = function () { return /windows|win32/i.test(navigator.userAgent); }();