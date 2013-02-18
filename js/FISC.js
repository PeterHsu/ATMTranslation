function ATMParse(hex) {
	var obj;
	var msgType = getMsgType(hex.substr(6,8));
	var source = getSource(hex.substr(50,6));
	var result = getResult(hex.substr(88,8));
	var code = HexToString(hex.substr(14,8));
	$("#msg").text(code + " " + msgType + " " + source + " " + result);
	obj = FISCBuild(code+msgType+source+result);
	
	var index = 0;
	var ret = Enumerable.from(obj).select(function(m){
		var len;
		if(typeof m.value == "string") {
			if(m.value.substr(0,1) == "B") {
				len = m.value.substr(1,3) * 2;
				m.hex = hex.substr(index,len);
				m.value = HexToBinary(m.hex);
			} else if(m.value.substr(0,1) == "N") {
				len = m.value.substr(1,3) * 2;
				m.hex = hex.substr(index,len);
				m.value = parseInt(m.hex,16);
			} else if(m.value.substr(0,1) == "C") {
				len = m.value.substr(1,3) * 2;
				m.hex = hex.substr(index,len);
				m.value = HexToCurrency(m.hex);
			} else if(m.value.substr(0,1) == "X") { //B(V)(LL+Data)
				var tempLen = m.value.substr(1,3) * 2;
				len = parseInt(hex.substr(index, tempLen),16) * 2;
				m.hex = hex.substr(index,len);
				m.value = HexToString(m.hex);
			}
		} else {
			len = m.value * 2;
			m.hex = hex.substr(index,len);
			m.value = HexToString(m.hex);
		}
		m.index = index/2;
		m.length = len/2;
		index += len;
		return m;
	}).toArray();
	// BitMap
	var bitMap = ret[9].value.replace("-","");
	$("#err").text(bitMap);
	// 當資料有發生溢位時, 增加溢位欄位來顯示溢位資料
	if(index < hex.length) {
		var len = hex.length - index
		ret.push({"key":"溢位","index":index/2,"length":len/2,"hex":hex.substr(index,len),"value":HexToString(hex.substr(index,len))});
		$("#err").text("溢位");
	} else if(index > hex.length) {
		$("#err").text("長度不足");
	} else {$("#err").text("");}
	return ret;
}
function getMsgType(t) {
	switch(t) {
		case "30323030":
			return "request";
		case "30323130":
			return "response";
		case "30323032":
			return "confirmation";
	}
}
function getSource(t) {
	if(t == "383135") {
		return "代理";
	} else {
		return "被代理";
	}
}
function getResult(t) {
	switch(t) {
		case "34303031":
			return "positive";
		case "30303030":
		case "30303031":
			return "first";
		default:
			return "negative";
	}
}
Number.prototype.toBinaryString = function() {
	var n = "0000" + this.toString(2);
	return n.substr(n.length-4,4);
}
function HexToString(s) {
	return Enumerable.range(0,s.length).where("$%2==0").select(function(index){return String.fromCharCode(parseInt(s.substr(index,2),16));}).toJoinedString();
}
function HexToBinary(s) {
	return Enumerable.from(s).select("parseInt($,16).toBinaryString()").toJoinedString("-");
}
function HexToCurrency(s) {
	var currency = HexToString(s);
	var ret = "." + currency.substr(currency.length-2,2);
	currency = currency.substr(0,currency.length-2);
	while(currency.length>3) {
		ret = "," + currency.substr(currency.length-3,3) + ret;
		currency = currency.substr(0,currency.length-3);
	}
	ret = currency + ret;
	return ret;
}
// 動態產生電文物件
function FISCBuild(code) {
	var fisc = {};
	fisc.SYSHeader=3;
	fisc.訊息類別代碼=4;
	fisc.交易類別代碼=4;
	fisc.查詢序號=7;
	fisc.收信單位代號=7;
	fisc.發信單位代號=7;
	fisc.交易啟動日期及時間=12;
	fisc.回應代碼=4;
	fisc.MAC_Key=4;
	fisc[FISCMsg[code]]="B8";
	var bitMap = HexToBinary(FISCMsg[code]).replace(/-/g,"");
	for(var i=0;i<bitMap.length;i++) {
		if(bitMap[i] == "1") {
			var field = DataField.ATM[i+1];
			fisc[field.key] = field.value;
		}
	}
	return fisc;
}
// DataField共用欄位
var DataField = {
	ATM:{
		3:{key:"交易金額",value:"C14"},
		6:{key:"代付單位CDATM代號",value:8},
		7:{key:"存戶可用餘額",value:"C14"},
		8:{key:"預先授權交易金額",value:14},
		9:{key:"IC卡交易序號",value:8},
		10:{key:"代收編號",value:12},
		11:{key:"端末設備查核碼",value:8},
		12:{key:"預先授權IC卡交易序號",value:8},
		13:{key:"發信行代號",value:7},
		14:{key:"收信行代號",value:7},
		15:{key:"跨行手續費",value:4},
		17:{key:"狀況代號",value:2},
		19:{key:"交易日期",value:14},
		21:{key:"訂單號碼",value:16},
		22:{key:"促銷應用訊息",value:16},
		28:{key:"端末設備型態",value:4},
		30:{key:"繳納截止日",value:6},
		32:{key:"入扣帳日",value:6},
		38:{key:"實際交易付款金額",value:"C14"},
		40:{key:"繳款類別",value:5},
		41:{key:"稽徵機關",value:3},
		42:{key:"身分證號_統一編號",value:11},
		44:{key:"特約商店代號",value:30},
		48:{key:"附言欄",value:40},
		49:{key:"繳費作業手續費",value:4},
		50:{key:"該單位應收手續費",value:20},
		51:{key:"轉入帳號",value:16},
		52:{key:"轉出帳號",value:16},
		53:{key:"原交易序號",value:10},
		54:{key:"銷帳編號",value:16},
		55:{key:"IC卡備註欄",value:30},
		56:{key:"交易驗證碼",value:"X2"},
		64:{key:"MAC押碼",value:4}
	}
}
// 電文的BitMap設定
var FISCMsg = {
	"2500request代理first":          "04A0001000001301",
	"2500response代理positive":      "0602000004000001",
	"2500response代理negative":      "0400000000000001",
	"2500request被代理first":        "04A0001000001301",
	"2500response被代理positive":    "0602000004000001",
	"2500response被代理negative":    "0400000000000001",
	"2510request代理first":          "24A0200000001301",
	"2510response代理positive":      "2602000104000001",
	"2510response代理negative":      "2400000000000001",
	"2510confirmation代理positive":  "2400000000000001",
	"2510confirmation代理negative":  "2400000000000001",
	"2510request被代理first":        "24A0200100001301",
	"2510response被代理positive":    "2602000004000001",
	"2510response被代理negative":    "2400000000000001",
	"2510confirmation被代理positive":"2400000000000001",
	"2510confirmation被代理negative":"2400000000000001",
	"2521request代理first":          "24AC201000003201",
	"2521response代理positive":      "2400000100000001",
	"2521response代理negative":      "2400000000000001",
	"2521confirmation代理positive":  "2400000000000001",
	"2521confirmation代理negative":  "2400000000000001",
	"2521request被代理first":        "240C000100003001",
	"2521response被代理positive":    "2400000000000001",
	"2521response被代理negative":    "2400000000000001",
	"2521confirmation被代理positive":"2400000000000001",
	"2521confirmation被代理negative":"2400000000000001",
	"2522request代理first":          "24AC201000003301",
	"2522response代理positive"      :"2602040104000001",
	"2522response代理negative"      :"2400000000000001",
	"2522confirmation代理positive":  "2400000000000001",
	"2522confirmation代理negative":  "2400000000000001",
	"2522request被代理first":        "24AC201100003301",
	"2522response被代理positive":    "2602000004000001",
	"2522response被代理negative":    "2400000000000001",
	"2522confirmation被代理positive":"2400000000000001",
	"2522confirmation被代理negative":"2400000000000001",
	"2523request代理first":          "24AC201000003301",
	"2523response代理positive":      "2602040104000001",
	"2523response代理negative":      "2400000000000001",
	"2523confirmation代理positive":  "2400000000000001",
	"2523confirmation代理negative":  "2400000000000001",
	"2523request被代理first":        "24AC201100003301",
	"2523response被代理positive":    "2602000004000001",
	"2523response被代理negative":    "2400000000000001",
	"2523confirmation被代理positive":"2400000000000001",
	"2523confirmation被代理negative":"2400000000000001",
	"2524request代理first":          "24AC201000003301",
	"2524response代理positive":      "2602040104000001",
	"2524response代理negative":      "2400000000000001",
	"2524confirmation代理positive":  "2400000000000001",
	"2524confirmation代理negative":  "2400000000000001",
	"2524request被代理first":        "24AC201100003301",
	"2524response被代理positive":    "2602000004000001",
	"2524response被代理negative":    "2400000000000001",
	"2524confirmation被代理positive":"2400000000000001",
	"2524confirmation被代理negative":"2400000000000001",
	"2525request被代理first":        "24AC201101003301",
	"2525response被代理positive":    "2600000004000001",
	"2525response被代理negative":    "2400000000000001",
	"2525confirmation被代理positive":"2400000000000001",
	"2525confirmation被代理negative":"2400000000000001",
	"2531request代理first":          "24A0201401001701",
	"2531response代理positive":      "2606000104000001",
	"2531response代理negative":      "2400000000000001",
	"2531confirmation代理positive":  "2400000000000001",
	"2531confirmation代理negative":  "2400000000000001",
	"2531request被代理first":        "24A8201501003701",
	"2531response被代理positive":    "2606000004000001",
	"2531response被代理negative":    "2400000000000001",
	"2531confirmation被代理positive":"2400000000000001",
	"2531confirmation被代理negative":"2400000000000001",
	"2532request代理first":          "24A4201401001601",
	"2532response代理positive":      "2408000100002001",
	"2532response代理negative":      "2400000000000001",
	"2532confirmation代理positive":  "2400000000000001",
	"2532confirmation代理negative":  "2400000000000001",
	"2541request被代理first":        "24A0281100101301",
	"2541response被代理positive":    "2402000000000001",
	"2541response被代理negative":    "2400000000000001",
	"2541confirmation被代理positive":"2400000000000001",
	"2541confirmation被代理negative":"2400000000000001",
	"2542request被代理first":        "24A0A81100101B01",
	"2542response被代理positive":    "2400000000000001",
	"2542response被代理negative":    "2400000000000001",
	"2542confirmation被代理positive":"2400000000000001",
	"2542confirmation被代理negative":"2400000000000001",
	"2561request代理first":          "24EC201001011201",
	"2561response代理positive":      "240000010000E001",
	"2561response代理negative":      "2400000000000001",
	"2561confirmation代理positive":  "2400000000000001",
	"2561confirmation代理negative":  "2400000000000001",
	"2561request被代理first":        "244C00010101F001",
	"2561response被代理positive":    "2400000000000001",
	"2561response被代理negative":    "2400000000000001",
	"2561confirmation被代理positive":"2400000000000001",
	"2561confirmation被代理negative":"2400000000000001",
	"2562request代理first":          "24EC201001011301",
	"2562response代理positive":      "260000010400E001",
	"2562response代理negative":      "2400000000000001",
	"2562confirmation代理positive":  "2400000000000001",
	"2562confirmation代理negative":  "2400000000000001",
	"2562request被代理first":        "24EC20110101F301",
	"2562response被代理positive":    "2600000004000001",
	"2562response被代理negative":    "2400000000000001",
	"2562confirmation被代理positive":"2400000000000001",
	"2562confirmation被代理negative":"2400000000000001",
	"2563request代理first":          "24EC201001011301",
	"2563response代理positive":      "260004010400E001",
	"2563response代理negative":      "2400000000000001",
	"2563confirmation代理positive":  "2400000000000001",
	"2563confirmation代理negative":  "2400000000000001",
	"2563request被代理first":        "24EC20110101F301",
	"2563response被代理positive":    "2600000004000001",
	"2563response被代理negative":    "2400000000000001",
	"2563confirmation被代理positive":"2400000000000001",
	"2563confirmation被代理negative":"2400000000000001",
	"2564request代理first":          "24EC201001011301",
	"2564response代理positive":      "260004010400E001",
	"2564response代理negative":      "2400000000000001",
	"2564confirmation代理positive":  "2400000000000001",
	"2564confirmation代理negative":  "2400000000000001",
	"2564request被代理first":        "24EC20110101F301",
	"2564response被代理positive":    "2600000004000001",
	"2564response被代理negative":    "2400000000000001",
	"2564confirmation被代理positive":"2400000000000001",
	"2564confirmation被代理negative":"2400000000000001"
}

