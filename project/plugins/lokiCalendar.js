//全域變數宣告區
//...

const fetchPath = './db.json';
// fetch(fetchPath, { method: 'GET' })
//     .then((response) => {
//         console.log(response);
//         return response.json();
//     .then((json) => console.log(json.nationalHolodays));

let nationalHoliday, pallet, booked;
let calendarCtrl;
const tableData = { //初始的表格資料
    totalPrice: 0, // 總價
    normalCount: 0, // 平日入住數
    holidayCount: 0, // 平日入住數
    pallet: { //營位資料 => 標題名稱、可賣數量、預約日金、小計、訂購數
        aArea: { title: '河畔 × A 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 },
        bArea: { title: '山間 × B 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 },
        cArea: { title: '平原 × C 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 },
        dArea: { title: '車屋 × D 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 }
    }
};


//------------init (初始化區)
dayjs.locale('zh-tw');
dayjs.extend(window.dayjs_plugin_localeData);
dayjs.extend(window.dayjs_plugin_isSameOrBefore); //擴充功能
dayjs.extend(window.dayjs_plugin_isBetween); //擴充功能

fetchData();
//----------- private methods (私有方法區)
async function fetchData() {
    const response = await fetch(fetchPath, { method: "GET" }); // 用 fetch 走去 db.json 那邊抓資料。await 的意思是「等檔案下載完才准往下一行走」。
    const json = await response.json(); // 把抓到的原始檔案，讓電腦看得懂的 JSON 物件。
    ({ nationalHoliday, pallet, booked } = json); // 把剛剛準備好的三個空箱子打開，把下載下來的資料精準地倒進去。

    // console.log(json);

    // calendarService();
    calendarCtrl = calendarService();
    calendarCtrl.print();

    // 綁定切換月份按鈕
    document.querySelector(".ctrlBtn").addEventListener("click", (e) => {
        e.preventDefault();
        calendarCtrl.swap(e.target.closest("a").getAttribute("href"));
    });

    // 選擇日期
    document.querySelector(".calendar").addEventListener("click", (e) => {
        e.preventDefault();
        const sltDay = e.target.closest(".selectDay");
        sltDay && calendarCtrl.choose(sltDay);
    });
}


const calendarService = () => {
    let theDay = dayjs();
    const today = dayjs();
    // 左邊行事曆
    const objL = {
        listBox: "",
        title: "",
        thisDate: theDay, //.format(),
    };

    // 右邊行事曆
    const objR = {
        listBox: "",
        title: "",
        thisDate: theDay.add(1, "month"), //.format(),
    };
    // 建立行事曆
    const chooseDays = [null, null];

    const listMaker = (obj) => {
        // console.log(objL, objR);
        const firstDay = dayjs(obj.thisDate).startOf("month").day(); // 0: 星期天
        const totalDay = dayjs(obj.thisDate).daysInMonth(); // 30

        // step1. firstDay => 跑幾次 for 產生幾個空白
        /*
        1 => 0
        2 => 1
        3 => 2
        4 => 3
        5 => 4
        6 => 5
        0 or 7 => 6     
        */
        for (let i = 1; i < (firstDay || 7); i++) {
            obj.listBox += `<li class="JsCal"></li>`;
        }

        /* step2. 跑幾次帶值日子 */
        for (let i = 1; i <= totalDay; i++) {
            // obj.listBox += `<li class="JsCal">${i}</li>`;
            let className = "JsCal";
            const currentDate = obj.thisDate.date(i);
            const currentDateYMD = currentDate.format("YYYY-MM-DD");


            // 判斷class 外觀
            // 1.是否過期

            if (currentDate.isSameOrBefore(today)) className += " delDay";
            else {
                className += " selectDay";
                // 方法一：星期六日, dyajs().day() === 6 or 0
                // const getDay = obj.thisDate.date(i).day();
                // if (getDay === 6 || getDay === 0) className += " holiday"

                // 方法二：用1號在周幾, 推算1是否為假日
                /**
                 * 1號的day值=>0, i === 1,7,8,14,25,21,22,28,29
                 * 1號的day值=>1, i === 6,7,13,14,20,21,27,28
                 * 1號的day值=>2, i === 5,6,12,13,19,20,26,27
                 * 1號的day值=>3, i === 4,5,11,12,18,19,25,26
                 * 1號的day值=>4, i === 3,4,10,11,17,18,24,25
                 * 1號的day值=>5, i === 2,3,9,10,16,17,23,24
                 * 1號的day值=>6, i === 1,2,8,9,15,16,22,23
                 * 1號的day值=>x, (x+i)%7 === 0 or 1 都是紅字
                */
                //        if ((firstDay + i) % 7 < 2) className += " holiday";
                //    }
                // 2.是否國定假日 =>
                //     if (
                //         (firstDay + i) % 7 < 2 || nationalHoliday.includes(obj.thisDate.date(i).format("YYYY-MM-DD"))
                //     )
                //         className += " holiday";
                // }

                if ((firstDay + i) % 7 < 2 || nationalHoliday.includes(currentDateYMD))
                    className += " holiday";

                // 2-2. 是否客滿
                const currentBook = booked.find((item) => item.date === currentDateYMD);
                currentBook &&
                    Object.values(currentBook.sellout).reduce((a, c) => a + c, 0) ===
                    pallet.count &&
                    (className += " fullDay");
            }

            //     const isFull = true;
            //     if (isFull) className += " fullDay";
            // }

            // const holiday = nationalHoliday.find(
            //     (item) => item === obj.thisDate.date(i).format("YYYY-MM-DD"),
            // );
            // if (holiday) className += " holiday";
            // }

            //----------------------------- B. 插入 li
            obj.listBox += `<li class="${className}"data-date="${currentDateYMD}">${i}</li>`;
        }

        obj.title = `${dayjs.monthsShort()[obj.thisDate.month()]} ${obj.thisDate.year()}`;

        // return obj; // 有沒有都不重要
    };

    const listPrint = () => {

        listMaker(objL);
        listMaker(objR);

        // const result = listMaker(objL).listBox;

        // document.querySelector(".leftDayList").innerHTML = listMaker(objL).listBox;
        // document.querySelector(".rightDayList").innerHTML = listMaker(objR).listBox;

        document.querySelector(".leftDayList").innerHTML = objL.listBox;
        document.querySelector(".rightDayList").innerHTML = objR.listBox;
        document.querySelector(".leftBar>h4").innerHTML = objL.title;
        document.querySelector(".rightBar>h4").innerHTML = objR.title;

    };

    const chooseList = (node) => {
        const [fst, sec] = chooseDays;
        switch (true) {
            case !fst && !sec: // [null,null]
                chooseDays[0] = node;
                node.classList.add("selectHead");
                break;
            case fst && !sec: // [1st,null]
                chooseDays[1] = node;

                // 判斷是否為 [2nd,1st]
                is2before1 = dayjs(node.dataset.date).isSameOrBefore(
                    dayjs(chooseDays[0].dataset.date),
                );
                if (is2before1) { // 需要修正
                    chooseDays[0].classList.replace("selectHead", "selectFoot");
                    chooseDays[1].classList.add("selectHead");
                    [chooseDays[1], chooseDays[0]] = [chooseDays[0], chooseDays[1]];
                } else chooseDays[1].classList.add("selectFoot");

                // 補上 selectConnect
                document.querySelectorAll(".calendar li.selectDay").forEach((item) => {
                    const isBetween = dayjs(item.dataset.date).isBetween(
                        chooseDays[0].dataset.date,
                        chooseDays[1].dataset.date,
                    );
                    isBetween && item.classList.add("selectConnect");
                });
                break;
            default:
                // 拔頭尾
                chooseDays.forEach((item) =>
                    item.classList.remove("selectHead", "selectFoot"));
                // 拔身體
                document
                    .querySelectorAll("li.selectConnect")
                    .forEach((item) => item.classList.remove("selectConnect"));

                //新頭
                node.classList.add("selectHead");
                // chooseDays = [node, null];
                chooseDays[0] = node;
                chooseDays[1] = null;
                break;
        }
    };

    const changeMonth = (count) => {
        theDay = theDay.add(count, "month");
        objL.listBox = "";
        objL.thisDate = theDay;
        objR.listBox = "";
        objR.thisDate = theDay.add(1, "month");
    };

    const tableMaker = () => {
        //更新全域變數內的 tableData
        console.log("tableMaker");
    };

    const tablePrint = () => {
        //把全域變數內的 tableData印在畫面
        // console.log("tablePrint");
        document.querySelectorAll("#selectPallet select").forEach((node) => {
            const palletName = node.name;
            const count = tableData.palletName[palletName].sellCount;

        });

    };


    return {
        print: listPrint,
        swap: (v) => {
            changeMonth(v === "#prevCtrl" ? -1 : 1);
            listPrint();
        },
        choose: (node) => {
            if (node === chooseDays[0] && !chooseDays[1]) return;
            chooseList(node);
        },
        refresh: tablePrint,
    };
};


