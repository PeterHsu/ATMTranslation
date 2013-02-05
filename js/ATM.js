function ATMParse(data) {
	var hex = getHex(data);
	var obj;
	if(hex.substr(0,8)=="4E435249") {
		$("#msg").text("ATM to Host");
		obj = factoryATM(HexToString(hex.substr(28,8)));
	} else {
		$("#msg").text("Host to ATM");
		obj = factoryHost(HexToString(hex.substr(0,8)));
	}
	var index = 0;
	var ret = Enumerable.from(obj).select(function(m){
		var len = m.value * 2;
		m.index = index/2;
		m.length = len/2;
		m.hex = hex.substr(index,len);
		m.value = HexToString(m.hex);
		index += len;
		return m;
	}).toArray();
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
function getHex(data) {
	var msg = $(data).find("TX_Message")
	if(msg.length > 0) {
		return msg.text();
	} else {
		return data;
	}
}
function HexToString(s) {
	return Enumerable.range(0,s.length).where("$%2==0").select(function(index){return String.fromCharCode(parseInt(s.substr(index,2),16));}).toJoinedString();
}
function factoryATM(code) {
	switch(code) {
		case "4010":
			return new ATM4010ATM();
		case "4060":
			return new ATM4060ATM();
		case "4070":
			return new ATM4070ATM();
		case "4071":
			return new ATM4071ATM();
	}
}
function factoryHost(code) {
	switch(code) {
		case "4010":
			return new ATM4010Host();
		case "4060":
		case "4070":
		case "4071":
			return new ATM4060Host();
	}
}
// 以下為電文規格,
// 依規格加入欄位名稱及長度,
// 除了INMSGHD外,大項會有一個byte為長度,
// 例如CHDACT_13,固定長度為19,我會以16進位13附加在欄位名稱_13
// 長度19加上一個長度byte,故為20,在畫面上容易看出其值有沒有錯誤。
// [__欄位名稱]主要是顯示細項欄位,做出類似縮排效果幫助判認。
// 大項底下有細分細項時,大項的長度就設為一,取其長度byte,例如this.TOTINF_F9=1;
// 大項無資料時長度值為00,
// 例如AMT_0B=1, 其長度應為11, 但因無資料, 故只有長度值為00的一個byte。
function ATM4010ATM() {
	// INMSGHD
	this.__交易代號=4;
	this.__送信日期時間=10;
	this.__電文格式=4;
	this.__仟元美金鈔匣=1;
	this.__佰元港幣鈔匣=1;
	this.__Reverse日幣鈔匣=1;
	this.__DISP吐鈔模組=1;
	this.__JOURNAL_PRINT=1;
	this.__RECEIPT_PRINT=1;
	this.__存款狀態=1;
	this.__MCRW=1;
	this.__Reserve=2;
	this.__Filler1_1=1;
	this.__Filler1_2=1;
	this.__ATM營業狀態=1;
	this.__ATM帳務MODE=1;
	this.__ATM交易序號=5;
	this.TXNMODE_01=2;
	this.CHDACT_13=20;
	this.TXNACT_13=20;
	this.AMT_0B=1;
	this.CASHCNT_08=1;
	this.TRACT_13=1;
	this.DEPSEQ_06=1;
	this.PINTRK_78=121;
	this.PINVALUE_04=1;
	this.EXPCD_11=1;
	this.TOTINF_F9=1;
	this.__IC卡交易序號=8;
	this.__端未設備檢查碼=8;
	this.__交易日期時間=14;
	this.__端未設備型態=4;
	this.__IC卡備註欄=30;
	this.__交易驗證碼=130;
	this.__FILLER=55
	this.NEWCASH_10=1;
	this.SYNCH_04=1;
	this.MAC_04=5;
	this.TERMID_05=6;
}
function ATM4010Host() {
	// OUTNMSGHD
	this.__電文格式=4;
	this.__交易序號=5;
	this.__本_次日帳=1;
	this.TXNSEQ_0D=14;
	this.CHDACT_13=20;
	this.TXNACT_13=20;
	this.AMT_0B=1;
	this.CASHCNT_08=1;
	this.CHARGE_03=1;
	this.BAL_A_1A=27;
	this.BAL_B_1A=27;
	this.EXPCD_04=5;
	this.CAPFLAG_01=2;
	this.TOTINF_F9=1;
	this.DATIME_0C=1;
	this.CKEY_10=1;
	this.TRINF_D0=1;
	this.TK3INF_69=106;
	this.STAN_NO_07=8;
	this.轉帳入帳日期_06=1;
}
function ATM4060ATM() {
	// INMSGHD
	this.__交易代號=4;
	this.__送信日期時間=10;
	this.__電文格式=4;
	this.__仟元美金鈔匣=1;
	this.__佰元港幣鈔匣=1;
	this.__Reverse日幣鈔匣=1;
	this.__DISP吐鈔模組=1;
	this.__JOURNAL_PRINT=1;
	this.__RECEIPT_PRINT=1;
	this.__存款狀態=1;
	this.__MCRW=1;
	this.__Reserve=2;
	this.__Filler1_1=1;
	this.__Filler1_2=1;
	this.__ATM營業狀態=1;
	this.__ATM帳務MODE=1;
	this.__ATM交易序號=5;
	this.TXNMODE_01=2;
	this.CHDACT_13=20;
	this.TXNACT_13=20;
	this.AMT_0B=12;
	this.CASHCNT_08=1;
	this.TRACT_13=20;
	this.DEPSEQ_06=1;
	this.PINTRK_78=121;
	this.PINVALUE_04=1;
	this.EXPCD_11=18;
	this.TOTINF_F9=1;
	this.__IC卡交易序號=8;
	this.__端未設備檢查碼=8;
	this.__交易日期時間=14;
	this.__端未設備型態=4;
	this.__IC卡備註欄=30;
	this.__交易驗證碼=130;
	this.__FILLER=55
	this.NEWCASH_10=1;
	this.SYNCH_04=5;
	this.MAC_04=5;
	this.TERMID_05=6;
}
function ATM4060Host() {
	// OUTNMSGHD
	this.__電文格式=4;
	this.__交易序號=5;
	this.__本_次日帳=1;
	this.TXNSEQ_0D=14;
	this.CHDACT_13=20;
	this.TXNACT_13=20;
	this.AMT_0B=12;
	this.CASHCNT_08=1;
	this.CHARGE_03=4;
	this.BAL_A_1A=27;
	this.BAL_B_1A=27;
	this.EXPCD_04=5;
	this.CAPFLAG_01=2;
	this.TOTINF_F9=1;
	this.DATIME_0C=1;
	this.CKEY_10=17;
	this.TRINF_D0=1;
	this.TK3INF_69=106;
	this.STAN_NO_07=8;
	this.轉帳入帳日期_06=7;
}
function ATM4071ATM() {
	// INMSGHD
	this.__交易代號=4;
	this.__送信日期時間=10;
	this.__電文格式=4;
	this.__仟元美金鈔匣=1;
	this.__佰元港幣鈔匣=1;
	this.__Reverse日幣鈔匣=1;
	this.__DISP吐鈔模組=1;
	this.__JOURNAL_PRINT=1;
	this.__RECEIPT_PRINT=1;
	this.__存款狀態=1;
	this.__MCRW=1;
	this.__Reserve=2;
	this.__Filler1_1=1;
	this.__Filler1_2=1;
	this.__ATM營業狀態=1;
	this.__ATM帳務MODE=1;
	this.__ATM交易序號=5;
	this.TXNMODE_01=2;
	this.CHDACT_13=20;
	this.TXNACT_13=20;
	this.AMT_0B=12;
	this.CASHCNT_08=9;
	this.TRACT_13=20;
	this.DEPSEQ_06=1;
	this.PINTRK_78=121;
	this.PINVALUE_04=1;
	this.EXPCD_11=18;
	this.TOTINF_F9=1;
	this.__IC卡交易序號=8;
	this.__端未設備檢查碼=8;
	this.__交易日期時間=14;
	this.__端未設備型態=4;
	this.__IC卡備註欄=30;
	this.__交易驗證碼=130;
	this.__FILLER=55
	this.NEWCASH_10=17;
	this.SYNCH_04=5;
	this.MAC_04=5;
	this.TERMID_05=6;
}
function ATM4070ATM() {
	// INMSGHD
	this.__交易代號=4;
	this.__送信日期時間=10;
	this.__電文格式=4;
	this.__仟元美金鈔匣=1;
	this.__佰元港幣鈔匣=1;
	this.__Reverse日幣鈔匣=1;
	this.__DISP吐鈔模組=1;
	this.__JOURNAL_PRINT=1;
	this.__RECEIPT_PRINT=1;
	this.__存款狀態=1;
	this.__MCRW=1;
	this.__Reserve=2;
	this.__Filler1_1=1;
	this.__Filler1_2=1;
	this.__ATM營業狀態=1;
	this.__ATM帳務MODE=1;
	this.__ATM交易序號=5;
	this.TXNMODE_01=2;
	this.CHDACT_13=20;
	this.TXNACT_13=20;
	this.AMT_0B=12;
	this.CASHCNT_08=1;
	this.TRACT_13=20;
	this.DEPSEQ_06=1;
	this.PINTRK_78=121;
	this.PINVALUE_04=1;
	this.EXPCD_11=1;
	this.TOTINF_F9=1;
	this.__IC卡交易序號=8;
	this.__端未設備檢查碼=8;
	this.__交易日期時間=14;
	this.__端未設備型態=4;
	this.__IC卡備註欄=30;
	this.__交易驗證碼=130;
	this.__FILLER=55
	this.NEWCASH_10=1;
	this.SYNCH_04=5;
	this.MAC_04=5;
	this.TERMID_05=6;
}
