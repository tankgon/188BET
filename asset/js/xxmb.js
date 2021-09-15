'use strict'

function fix1Number(n) {

    if (n < 10) {
        n = "0" + n;
    }
    return n;
}

function fix2Number(n) {

    if (n < 10) {
        n = "00" + n;
    } else if (n < 100) {
        n = "0" + n;
    }
    return n;
}

function fix3Number(n) {
    if (n < 10) {
        n = "000" + n;
    } else if (n < 100) {
        n = "00" + n;
    } else if (n < 1000) {
        n = "0" + n;
    }
    return n;
}

function fix4Number(n) {
    if (n < 10) {
        n = "0000" + n;
    } else if (n < 100) {
        n = "000" + n;
    } else if (n < 1000) {
        n = "00" + n;
    } else if (n < 10000) {
        n = "0" + n;
    }
    return n;
}
function createStorage(key) {
    const storage = JSON.parse(localStorage.getItem(key)) ?? {};
    function save() {
        localStorage.setItem(key, JSON.stringify(storage));
    }
    
    return {
        get(key) {
            return storage[key];
        },
        set(key, value) {
            storage[key] = value;
            save();
        },
        remove(key) {
            delete storage[key];
            save();
        }
    };
}

function convertDate(d) {
    let hour = d.getHours();
    let minute = d.getMinutes();
    let date = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    return {
        date: `${date}/${month}/${year}`,
        time: `${hour}:${minute}`,
    }
}

const _$ = document.querySelector.bind(document);
const _$$ = document.querySelectorAll.bind(document);
const xxmbStorage = createStorage('xxmb');
const moneyStorage = createStorage('money');

//elem bkq
const kqElem = _$$('.bqg-kq');

//elem menu
const myMoneyElem = _$('.js-my-money');
const audioBackGroundElem = _$('.js-audioBackGround');
const audioWinElem = _$('.js-audioWin');
const dsldoContainerElem = _$('.js-dsldo-container');
const dsddoContainerElem = _$('.js-dsddo-container');
const startButtonElem = _$('.js-start-button');

//elem notify
const notifyTempContainerElem = _$('.js-money-decrease-temp-container');
const notifyTempTextElem = _$('.js-notify-decrease-temp-text');
const notifyTempMoneyElem = _$('.js-notify-decrease-temp-money');
const tbtdContainerElem = _$('.js-tbtd');
const tbtlContainerElem = _$('.js-tbtl');
const overlayElem = _$('.js-overlay');


let arrLoVuaDanh = [];
let arrDeVuaDanh = [];
let arrLoTrung = [];
let arrLichSuChoi = xxmbStorage.get('bls') ?? [];
let arrThongKeLo = xxmbStorage.get('btkl') ?? new Array(100).fill(0);
let arrThongKeDe = xxmbStorage.get('btkd') ?? new Array(100).fill(0);
let arrThongKeLoKhan = xxmbStorage.get('btklk') ?? new Array(100).fill(0);
let arrThongKeLoRoi = xxmbStorage.get('btklr') ?? new Array(100).fill(0);
let arrLoVuaRa = new Array(100).fill(0);
let myMoney = moneyStorage.get('value') || 999999;
myMoneyElem.innerText = myMoney;

let isAgain = false;

const app = {

    moneyBefore: myMoney,
    tienOanh: 0,
    tienTrung: 0,
    tienLai: 0,

    handleEvent: function() {
        //Xử lí âm thanh
        const volumnBtn = _$('.js-volumn-button');
        let isMute = false;
        volumnBtn.addEventListener('click', function() {
            if (isMute) {
                audioBackGroundElem.volume = 1;
                audioWinElem.volume = 1;
                volumnBtn.innerHTML = "Tắt tiếng";
                isMute = false;
            } else {
                audioBackGroundElem.volume = 0;
                audioWinElem.volume = 0;
                volumnBtn.innerHTML = "Bật tiếng";
                isMute = true;
            }
        })

        //reset
        const resetButton = _$('.js-reset-button');
        resetButton.addEventListener('click', function() {
            window.location.reload();
        })

        //xác nhận đánh Lô
        const OanhLoButton = _$('.js-lo-confirm-button');
        const inputLo = _$('input#soLo');
        const inputTienOanhLo = _$('input#tienOanhLo');
        app.handleInput(inputLo);

        OanhLoButton.addEventListener('click', function() {
            app.xacNhanOanh('lo', inputLo, inputTienOanhLo, arrLoVuaDanh);
        })
        
        //xác nhận đánh Đề
        const OanhDeButton = _$('.js-de-confirm-button');
        const inputDe = _$('input#soDe');
        const inputTienOanhDe = _$('input#tienOanhDe');
        app.handleInput(inputDe);

        OanhDeButton.addEventListener('click', function (e) {
            app.xacNhanOanh('de', inputDe, inputTienOanhDe, arrDeVuaDanh);
        })

        //bắt đầu quay
        startButtonElem.addEventListener('click', function() {

            if (isAgain) {
                let tienOanhVanTruoc = app.tienOanh;
                notifyTempMoneyElem.innerText = tienOanhVanTruoc;
                myMoney = myMoney + tienOanhVanTruoc;
                myMoneyElem.innerText = myMoney;
                app.resetPart();
            }

            for (let i = 0, length = arrThongKeLoKhan.length; i < length; i++){
                arrThongKeLoKhan[i]++;
            }

            app.tienLai = app.tienOanh;
            this.disabled = true;
            _$('.js-lo-confirm-button').disabled = true;
            _$('.js-de-confirm-button').disabled = true;

            startButtonElem.innerText = 'Đang quay';
            audioBackGroundElem.play();
            moneyStorage.set('value', myMoney)
            app.run();
        })

        //show bảng lịch sử
        const blsButtonElem = _$('.js-bls-button');
        const tableGroupElem = _$('.table-group');
        const tableGroup1Elem = _$('.table-group-1');
        blsButtonElem.addEventListener('click', function() {
            overlayElem.classList.toggle('d-none');
            tableGroupElem.classList.toggle('d-none');
            tableGroup1Elem.classList.toggle('d-none');
        })

        //show bảng thống kê
        const btkButtonElem = _$('.js-btk-button');
        const tableGroup2Elem = _$('.table-group-2');
        const tableGroup3Elem = _$('.table-group-3');
        btkButtonElem.addEventListener('click', function() {
            overlayElem.classList.toggle('d-none');
            tableGroupElem.classList.toggle('d-none');
            tableGroup2Elem.classList.toggle('d-none');
            tableGroup3Elem.classList.toggle('d-none');
        })

        //handle close table
        const tableCloseButton = _$$('.table-close-button')
        tableCloseButton.forEach(button => {
            button.addEventListener('click', function() {
                overlayElem.classList.toggle('d-none');
                _$$(`div[class^='table-group']`).forEach(i => {
                    i.classList.add('d-none');
                })
            })
        })

        //overlay handle
        overlayElem.addEventListener('click', function() {
            overlayElem.classList.toggle('d-none');
            _$$(`div[class^='table-group']`).forEach(i => {
                i.classList.add('d-none');
            })
        })
    }, 

    xacNhanOanh: function(key, input1, input2, arr) {
        
        if (isAgain){
            app.resetAll();
        }

        let alert1, alert2;
        let value = input1.value;
        let money = Math.abs(+input2.value);

        if (key === 'lo') {
            alert1 = 'Vui lòng nhập số Lô.';
            alert2 = 'Vui lòng nhập số tiền đánh Lô.';
        }else if (key === 'de') {
            alert1 = 'Vui lòng nhập số Đề.';
            alert2 = 'Vui lòng nhập số tiền đánh Đề.';
        }

        if (+value < 10) {
            value = fix1Number(+value);
        }
       
        if (!value) {
            alert(alert1);
            return;
        } else if (!money) {
            alert(alert2);
            return;
        } else if (money > myMoney) {
            alert("Tiền ít đòi hít lol thơm à bạn ey.")
            return;
        } 
        

        //check số vừa nhập
        const pos = arr.findIndex(i => i.value === value);
        if (pos !== -1 ){
            app.tienOanh += arr[pos].money;
            arr[pos] = { value, money };
        } else {
            arr.push({ value, money })
        }

        app.tienOanh = app.tienOanh - money;
        myMoney = app.moneyBefore + app.tienOanh;;

        notifyTempMoneyElem.innerText = app.tienOanh;
        myMoneyElem.innerText = myMoney;

        isAgain = false;
        startButtonElem.innerText = 'Bắt đầu quay';
        startButtonElem.disabled = false;
        notifyTempContainerElem.classList.remove('d-none');

        app.resetInput(input1, input2);
        app.render(key, arr);
    },

    //hàm render lô, đề vừa oánh
    render: function(key, arr) {
        if (key === 'lo') {
            renderLo();
        }else if (key === 'de') {
            renderDe();
        }

        function renderLo() {
            dsldoContainerElem.classList.remove('d-none');
            const htmls = `
                <span class=dsldo-label>Danh sách <span class="text-danger">Lô</span> đã oánh</span>
                <div class="js-dsldo-list row text-danger justify-content-center">
                    ${arr.map(i => {
                        return `
                            <span class="col-3 col-md-2 col-lg-6 p-1">${i.value}: ${i.money}</span>
                        `
                    }).join('')}
                </div>
            `
            dsldoContainerElem.innerHTML = htmls;
        }

        function renderDe() {
            dsddoContainerElem.classList.remove('d-none');
            const htmls = `
                <span class=dsddo-label>Danh sách <span class="text-danger">Đề</span> đã oánh</span>
                <div class="js-dsddo-list row text-danger justify-content-center">
                    ${arr.map(i => {
                        return `
                            <span class="col-3 col-md-2 col-lg-6 p-1">${i.value}: ${i.money}</span>
                        `
                    }).join('')}
                </div>
            `
            dsddoContainerElem.innerHTML = htmls;
        }
    },

    xuLiTrungLo: function (random){

        const kq = random % 100;
        arrThongKeLo[kq]++;
        arrLoVuaRa[kq] = 1;
        arrThongKeLoKhan[kq] = 0;

        if (!arrLoVuaDanh.length) return;

        const loTrung = arrLoVuaDanh.find(i => +i.value === kq);
        if (loTrung) {
            tbtlContainerElem.classList.remove('d-none');

            let tienTrungLo = loTrung.money * 3.5;
            app.tienLai += tienTrungLo;
            app.tienTrung += tienTrungLo;
            arrLoTrung.push(loTrung);
            const dsLoTrung = arrLoTrung.map(i => i.value);
            const tongTienTrung = arrLoTrung.reduce((a, b) => a + +b.money * 3.5, 0);
            notifyTempMoneyElem.innerText = app.tienLai > 0 ? `+${app.tienLai}` : app.tienLai;
            const htmls = `
                <span class="tbtl-label notify-label">
                    Chúc mừng bạn vừa trúng Lô
                </span>
                <span class="tbtl-ds-lo notify-number">${dsLoTrung}</span>
                <span class="tbtl-money notify-number">+${tongTienTrung}</span>
            `;
            tbtlContainerElem.innerHTML = htmls;
            audioWinElem.play();
            
        }
    },

    xuLiTrungDe: function (random){

        const kq = random % 100;
        arrThongKeDe[kq]++;

        if (!arrDeVuaDanh.length) return;
        
        const deTrung = arrDeVuaDanh.find(i => +i.value === kq);

        if (deTrung) {
            
            const tienTrungDe = +deTrung.money * 80;
            app.tienTrung += tienTrungDe;
            app.tienLai += tienTrungDe;

            const htmls = `
                <span class="tbtd-label notify-label">
                    Chúc mừng bạn vừa trúng Đề
                </span>
                <span class="tbtd-ds-lo notify-number">${deTrung.value}</span>
                <span class="tbtd-money notify-number">+${tienTrungDe}</span>
            `;

            tbtdContainerElem.classList.remove('d-none');

            tbtdContainerElem.innerHTML = htmls;
            audioWinElem.play();
            
        }
    },

    xuLiKetThuc: function (){

        myMoney = myMoney + app.tienTrung;
        myMoneyElem.innerText = myMoney;

        if (app.tienLai < 0) {
            notifyTempTextElem.innerText = 'Bạn vừa thua :(';
            notifyTempMoneyElem.innerText = app.tienLai;
        }else {
            notifyTempTextElem.innerText = 'Chúc mừng bạn vừa lãi';
            notifyTempMoneyElem.innerText = `+${app.tienLai}`;
        }

        if (app.tienTrung === 0) {
            const thongBao = `
                <span class="notify-label text-danger">Trượt hết CMNR hoho</span>
            `
            tbtlContainerElem.classList.remove('d-none')
            tbtlContainerElem.innerHTML = thongBao;
        }

        const date = new Date();
        const data = {
            date: convertDate(date).date,
            time: convertDate(date).time,
            ldo: arrLoVuaDanh,
            ddo: arrDeVuaDanh,
            tienLai: app.tienLai,
        }
        arrLichSuChoi.splice(0,0,data);
        if (arrLichSuChoi.length > 100) arrLichSuChoi.length = 100;

        for ( let i = 0; i < 100; i++){
            if (arrThongKeLoRoi[i] != 0 && arrLoVuaRa[i] != 0){
                arrLoVuaRa[i] += arrThongKeLoRoi[i];
            }
        }
        arrThongKeLoRoi = [...arrLoVuaRa];
        arrLoVuaRa = new Array(100).fill(0);

        startButtonElem.innerText = 'Oánh lại';
        startButtonElem.disabled = false;
        _$('.js-lo-confirm-button').disabled = false;
        _$('.js-de-confirm-button').disabled = false;
        isAgain = true;
        audioBackGroundElem.load();
        app.renderAllTable();
        app.save();
    },

    resetAll: function() {
        app.tienOanh = 0;
        arrLoVuaDanh.length = 0;
        arrDeVuaDanh.length = 0;
        dsldoContainerElem.classList.add('d-none');
        dsldoContainerElem.innerHTML = '';
        dsddoContainerElem.classList.add('d-none');
        dsddoContainerElem.innerHTML= '';
        notifyTempContainerElem.classList.add('d-none');
        app.resetPart();
    },

    resetPart: function () {
        app.tienTrung = 0;
        app.tienLai = 0;
        arrLoTrung.length = 0;
        notifyTempTextElem.innerText = 'Tạm thời'
        tbtlContainerElem.classList.add('d-none');
        tbtdContainerElem.classList.add('d-none');
        for (let i = 0; i < kqElem.length; i++) {
            if (i < 10) {
                kqElem[i].innerHTML = "00000";
            } else if (i < 20) {
                kqElem[i].innerHTML = "0000";
            } else if (i < 23) {
                kqElem[i].innerHTML = "000";
            } else {
                kqElem[i].innerHTML = "00";
            }
        }
    },

    //xử lí input nhập số lô, đề
    handleInput: function(input) {
        input.addEventListener('input', function(e) {
            const value = this.value;
            const maxLength = this.getAttribute('maxLength');
            if (value.length > maxLength) {
                this.value = value.slice(0, maxLength);
            }
        })
    },

    resetInput: function(...args) {
        args.forEach(arg => {
            arg.value = '';
        })
    },

    renderBangLichSu: function() {
        const bls = _$('#bls tbody');
        const html = arrLichSuChoi.map((i, index) => {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <span>${i.time}</span>
                        <span>${i.date}</span>
                    </td>
                    <td>${i.ldo.map(j => j.value)}</td>
                    <td>${i.ddo.map(j => j.value)}</td>
                    <td>${i.tienLai}</td>
                </tr>
            `
        }).join('');
        bls.innerHTML = html;
    },

    renderBangThongKe: function() {
        const btk = _$('#btk tbody');
        const html = arrThongKeLo.map((i, index) => {
            return `
                <tr>
                    <td>${fix1Number(index)}</td>
                    <td>${i}</td>
                    <td>${arrThongKeLoRoi[index]}</td>
                    <td>${arrThongKeLoKhan[index]}</td>
                    <td>${arrThongKeDe[index]}</td>
                </tr>
            `
        }).join('');
        btk.innerHTML = html;
    },

    renderSubTable: function() {
        const table1 = _$('#btkrin tbody');
        const table2 = _$('#btkrnn tbody');
        const table3 = _$('#btklk tbody');
        const table4 = _$('#btklr tbody');
        const count = arrThongKeDe.reduce((a, b) => a + b);
        const loMin = Math.min.apply(null, arrThongKeLo);
        const loMax = Math.max.apply(null, arrThongKeLo);
        const deMin = Math.min.apply(null, arrThongKeDe);
        const deMax = Math.max.apply(null, arrThongKeDe);
        const loKhan = Math.max.apply(null, arrThongKeLoKhan);
        const data1 = [];
        const data2 = [];
        const data3 = [];
        const data4 = [];
        const data5 = [];
        const data6 = [];
        let row1, row2, row3, row4, row5, row6;
        for ( let i = 0; i < 100; i++){
            if (arrThongKeLo[i] === loMin) {
                data1.push(fix1Number(i))
            }
            if (arrThongKeDe[i] === deMin) {
                data2.push(fix1Number(i))
            }
            if (arrThongKeLo[i] === loMax) {
                data3.push(fix1Number(i))
            }
            if (arrThongKeDe[i] === deMax) {
                data4.push(fix1Number(i))
            }
            if (arrThongKeLoKhan[i] === loKhan) {
                data5.push(fix1Number(i))
            }
            if (arrThongKeLoRoi[i] >= 2) {
                data6.push(fix1Number(i))
            }
        }
        if (count < 500) {
            row2 = `<tr>
                <td>Đề</td>
                <td colspan="2">Quay 500 lần để xem</td>
            </tr>`
        }else{
            row2 = `<tr>
                <td>Đề</td>
                <td>${data2}</td>
                <td>${deMin}</td>
            </tr>`
        }
        if (count < 50) {
            row1 = `<tr>
                <td>Lô</td>
                <td colspan="2">Quay 50 lần để xem</td>
            </tr>`;
        }else {
            row1= `<tr>
                <td>Lô</td>
                <td>${data1}</td>
                <td>${loMin}</td>
            </tr>`;
        }

        if (count < 10) {
            row3 = `<tr>
                <td>Lô</td>
                <td colspan="2">Quay 10 lần để xem</td>
            </tr>`;
            row5 = `
                <tr>
                    <td colspan="2">Quay 10 lần để xem</td>
                </tr>`;
        }else {
            row3= `<tr>
                <td>Lô</td>
                <td>${data3}</td>
                <td>${loMax}</td>
            </tr>`;
            row5 = `
                <tr>
                <td>${data5}</td>
                <td>${loKhan}</td>
            </tr>`;
        }

        if (count < 100) {
            row4 = `<tr>
                <td>Đề</td>
                <td colspan="2">Quay 100 lần để xem</td>
            </tr>`;
        }else {
            row4= `<tr>
                <td>Đề</td>
                <td>${data4}</td>
                <td>${deMax}</td>
            </tr>`;
        }

        row6 = `
            <tr>
                <td>${data6}</td>
            </tr>
        `

        table1.innerHTML = row1 + row2;
        table2.innerHTML = row3 + row4;
        table3.innerHTML = row5;
        table4.innerHTML = row6;
    },

    renderAllTable: function() {
        _$('.slqg').innerText = arrThongKeDe.reduce((a,b) => a + b);
        app.renderBangThongKe();
        app.renderBangLichSu();
        app.renderSubTable();
    },

    save: function(){
        moneyStorage.set('value', myMoney)
        xxmbStorage.set('bls', arrLichSuChoi);
        xxmbStorage.set('btkl', arrThongKeLo);
        xxmbStorage.set('btkd', arrThongKeDe);
        xxmbStorage.set('btklk', arrThongKeLoKhan);
        xxmbStorage.set('btklr', arrThongKeLoRoi);
        app.moneyBefore = myMoney;
    },

    //hàm quay giải
    run: function() {
        let ms = 1000;
        let run, random;
        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    clearInterval(run);
                    app.xuLiTrungLo(random);
                    resolve();
                }, ms);
            });
        }

        new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[1].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[2].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[3].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[4].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[5].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[6].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[7].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[8].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[9].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[10].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[11].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[12].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[13].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[14].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[15].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[16].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[17].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[18].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 9999);
                kqElem[19].innerText = fix3Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 999);
                kqElem[20].innerText = fix2Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 999);
                kqElem[21].innerText = fix2Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 999);
                kqElem[22].innerText = fix2Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99);
                kqElem[23].innerText = fix1Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99);
                kqElem[24].innerText = fix1Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99);
                kqElem[25].innerText = fix1Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99);
                kqElem[26].innerText = fix1Number(random);
            }, 100);
            return sleep(ms);
        })
        .then(() => {
            run = setInterval(() => {
                random = Math.round(Math.random() * 99999);
                kqElem[0].innerText = fix4Number(random);
            }, 100);
            return sleep(ms);
        })
        
        .catch(err => document.write(err))
        .finally(() => {
            app.xuLiTrungDe(random);
            app.xuLiKetThuc();
        })
    },

    start: function() {
        
        app.renderAllTable();
        app.handleEvent();
    }
}

app.start();