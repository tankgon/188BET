'use strict';

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

const bautomStorage = createStorage('bautom');
const moneyStorage = createStorage('money');

const resultDashBoard = _$('.js-cpt-dashboard')
const navDashBoard = _$('.js-dashboard-nav')
const notifyContainer = _$('.js-notify');
const notifyText = _$('.js-notify-text');
const moneyTempElem = _$('.js-money-decrease-temp');
const myMoneyElem = _$('.js-user-money');
const mainAudio = _$('.js-main-audio');
const loseAudio = _$('.js-lose-audio');
const victoryAudio = _$('.js-victory-audio');

let arrHistory = bautomStorage.get('history') ?? [];
let arrCountResult = bautomStorage.get('countResult') ?? new Array(6).fill(0);
let arrCountBet = bautomStorage.get('countBet') ?? new Array(6).fill(0);
let myMoney = moneyStorage.get('value') || 999999;
myMoneyElem.innerHTML = myMoney;

const app = {

    bet: [],
    totalBetMoney: 0,
    timeInterval: 100,
    timeOut: 5500,
    myMoneyBefore: myMoney,
    result1: 0,
    result2: 0,
    result3: 0,
    result: [
        {
            value: 0,
            img: '../asset/img/bautom/huou.png',
        },{
            value: 1,
            img: '../asset/img/bautom/bau.png',
        },{
            value: 2,
            img: '../asset/img/bautom/ga.png',
        },{
            value: 3,
            img: '../asset/img/bautom/ca.png',
        },{
            value: 4,
            img: '../asset/img/bautom/cua.png',
        },{
            value: 5,
            img: '../asset/img/bautom/tom.png',
        },
    ],

    handleEvent: function() {

        const userNav = _$('.js-dashboard-user');

        userNav.addEventListener('click', function(e) {
            const _this = e.target
            const isBetButton = _this.closest('.js-bet-button');
            const isReturnButton = _this.closest('.js-return-button');
            const isBetFastButton = _this.closest('.js-bet-fast-button');

            //xử lí đặt cược
            if (isBetButton) {
                const container = _this.parentNode;
                const betInput = container.querySelector('.js-bet-input');
                const money = Math.abs(+betInput.value);
                const value = +container.getAttribute('value');
                
                if (!money) {
                    alert('Chưa nhập tiền kìa bạn ey!!');
                    return;
                }
                else if (myMoney < money) {
                    alert('Tiền ít đòi hit lol thơm à bạn.');
                    betInput.value = myMoney;
                    return;
                } else if (isNaN(money)){
                    alert('dkm');
                    return;
                }

                const pos = app.bet.findIndex(i => i.value === value)
                pos !== -1
                ? app.bet[pos] = { value, money } 
                : app.bet.push({ value, money });

                _$('.js-start-button').disabled = false;
                container.classList.remove('unbet');
                container.innerHTML = app.betStep2Component(money);
                notifyContainer.classList.remove('d-none');
                notifyText.innerHTML = 'Tạm thời :';

                app.totalBetMoney = -app.bet.reduce((a, b) => a + b.money, 0);
                myMoney = app.myMoneyBefore + app.totalBetMoney;

                moneyTempElem.innerHTML = app.totalBetMoney;
                myMoneyElem.innerHTML = myMoney;
            }

            //xử lí đặt lại
            else if (isReturnButton) {
                const container = _this.parentNode;
                const value = +container.getAttribute('value');
                const pos = app.bet.findIndex(i => i.value === value);
                const money = app.bet[pos].money;
                
                app.bet.splice(pos, 1);
                app.totalBetMoney += money;
                myMoney += money;
                moneyTempElem.innerHTML = app.totalBetMoney;
                myMoneyElem.innerHTML = myMoney;
                container.innerHTML = app.betStep1Component(money);
                container.classList.add('unbet');
            }

            //xử lí đặt nhanh
            else if (isBetFastButton) {
                const container = _this.parentNode.parentNode;
                const betInput = container.querySelector('.js-bet-input');
                const money = +_this.dataset.value;
                
                betInput.value = +betInput.value + money;
            }
        })

        navDashBoard.addEventListener('click', function(e) {
            const _this = e.target;
            const isStartButton = _this.closest('.js-start-button');
            const isContinueButton = _this.closest('.js-continue-button');
            const isAgainButton = _this.closest('.js-again-button');

            //xử lí bắt đầu
            if (isStartButton) {

                _this.innerHTML = 'Đang xóc';
                _this.disabled = true;
                _$$('.js-bet-step-container.unbet').forEach(i => i.innerHTML = '');
                _$$('.js-return-button').forEach(i => i.disabled = true);

                app.run();
                app.save();

                //xử lí kết thúc
                setTimeout(() => {
                    clearInterval(app.runInterval);
                    app.xuLiKetThuc();
                }, app.timeOut)
            }

            //xử lí tiếp tục
            if (isContinueButton) {
                notifyContainer.classList.add('d-none');
                navDashBoard.innerHTML = app.navDashBoardComponent1();
                app.renderResultUnstart();
                app.bet.length = 0;
                _$$('.js-bet-step-container').forEach(i => {
                    i.innerHTML = app.betStep1Component();
                    i.classList.add('unbet');
                });
            }

            //xử lí oánh lại
            if (isAgainButton) {

                navDashBoard.innerHTML = `<button class="btn btn-success text-uppercase" disabled>Đang xóc</button>`
                notifyText.innerHTML = 'Tạm thời :';

                myMoney = app.myMoneyBefore + app.totalBetMoney;
                myMoneyElem.innerHTML = myMoney;
                moneyTempElem.innerHTML = app.totalBetMoney;
                
                app.run();
                app.save();
                
                //xử lí kết thúc
                setTimeout(() => {
                    clearInterval(app.runInterval);
                    app.xuLiKetThuc();
                }, app.timeOut)

            }
            
        })

        //show history mobile
        const history = _$('.js-history');
        const closeButton = _$('.js-history-close-button');
        const overlay = _$('.js-history-overlay');
        _$('.js-history-button').addEventListener('click', function() {
            history.classList.add('is-open');
            overlay.classList.toggle('d-none');
        })

        closeButton.addEventListener('click', function() {
            overlay.classList.toggle('d-none');
            history.classList.remove('is-open');
        })

        overlay.addEventListener('click', function() {
            overlay.classList.toggle('d-none');
            history.classList.remove('is-open');
        })

    },

    xuLiKetThuc: function() {
        let inComeMoney = app.totalBetMoney;
        let moneyReturn = 0;

        app.bet.forEach(i => {
            let isCheck = false;
            if (i.value === app.result1){
                inComeMoney += i.money;
                moneyReturn += i.money;
                isCheck = true;
            }
            if (i.value === app.result2){
                inComeMoney += i.money;
                moneyReturn += i.money;
                isCheck = true;
            }
            if (i.value === app.result3){
                inComeMoney += i.money;
                moneyReturn += i.money;
                isCheck = true;
            }

            if (isCheck) {
                inComeMoney += i.money;
                moneyReturn += i.money;
            }
        })

        myMoney += moneyReturn;
        myMoneyElem.innerHTML = myMoney;
        navDashBoard.innerHTML = app.navDashBoardComponent2(inComeMoney);

        if (inComeMoney > 0) {
            notifyText.innerHTML = 'Chúc mừng :';
            moneyTempElem.innerHTML = `+${inComeMoney}`;
            victoryAudio.play();
        } 
        else if (inComeMoney < 0) {
            notifyText.innerHTML = 'Thua rùi Hoho :';
            moneyTempElem.innerHTML = inComeMoney;
            loseAudio.play();
        } 
        else {
            notifyText.innerHTML = 'Hòa rùi :';
            moneyTempElem.innerHTML = inComeMoney;
        }

        // lưu lại lịch sử chơi
        const date = new Date();
        arrHistory.splice(0, 0, {
            bet: [...app.bet],
            money: inComeMoney,
            time: convertDate(date).time,
            date: convertDate(date).date,
            result: [app.result1, app.result2, app.result3],
        })

        if (arrHistory.length > 10) arrHistory.length = 10;

        //lưu lại số lần đặt cược
        app.bet.forEach(i => {
            arrCountBet[i.value]++;
        })

        //lưu lại kết quả vừa ra
        arrCountResult[app.result1]++;
        arrCountResult[app.result2]++;
        arrCountResult[app.result3]++;

        app.save();
        app.render();
    },

    renderHistory: function() {
        const history = _$('.js-history-body');
        let money, logo;
        const html = arrHistory.map((i, index) => {
            const betImage = i.bet.map(j => {
                return `
                    <img src="${app.result[j.value].img}" alt="" class="img-fluid history-img">
                `;
            }).join('');

            const resultImage = i.result.map(j => {
                return `
                    <img src="${app.result[j].img}" alt="" class="img-fluid history-img m-auto d-block">
                `;

            }).join('');
            
            if ( i.money > 0 ){
                money = `<span style="font-size: 16px;" class="text-success">+${i.money}</span>`;
                logo = `<img src="../asset/img/bautom/win.png" alt="" class="img-fluid"></img>`;
            } else if (i.money === 0){
                money = `<span style="font-size: 16px;" class="text-success">+${i.money}</span>`;
                logo = `<img src="../asset/img/bautom/hoa.png" alt="" class="img-fluid"></img>`;
            } else {
                money = `<span style="font-size: 16px;" class="text-danger">${i.money}</span>`;
                logo = `<img src="../asset/img/bautom/lose.png" alt="" class="img-fluid"></img>`;
            }

            return `
                <div class="history-item row mt-2">
                    <div class="betted col-4">
                        ${betImage}
                        <span class="text-success d-block">Đã đặt</span>
                    </div>
                    <div class="history-result col-4">
                        <span style="font-size: 16px;">#${index + 1}</span>
                        ${logo}
                        ${money}
                        <span>${i.time}</span>
                        <span>${i.date}</span>
                    </div>
                    <div class="col-4">
                        ${resultImage}
                        <span class="text-success">Kết quả</span>
                    </div>
                </div>
            `;
        }).join('');
        history.innerHTML = html;
    },

    renderCount: function() {
        const countResultElem = _$$('.js-count-result');
        const countBetElem = _$$('.js-count-bet');
        const countElem = _$('.js-count');
        
        countResultElem.forEach((i, index) => {
            i.innerHTML = arrCountResult[index];
        })
        countBetElem.forEach((i, index) => {
            i.innerHTML = arrCountBet[index];
        })

        countElem.innerHTML = arrCountResult.reduce((a, b) => a + b) / 3;
    },

    renderResultUnstart: function() {
        const random1 = app.random();
        const random2 = app.random();
        const random3 = app.random();
        const html = `
            <div class="col-4 position-relative">
                <img src="${app.result[random1].img}" alt="" class="img-fluid unbrightness">
                <img src="../asset/img/bautom/dauhoi.png" alt="" class="img-fluid img-temp">
            </div>
            <div class="col-4 position-relative">
                <img src="${app.result[random2].img}" alt="" class="img-fluid unbrightness">
                <img src="../asset/img/bautom/dauhoi.png" alt="" class="img-fluid img-temp">
            </div>
            <div class="col-4 position-relative">
                <img src="${app.result[random3].img}" alt="" class="img-fluid unbrightness">
                <img src="../asset/img/bautom/dauhoi.png" alt="" class="img-fluid img-temp">
            </div>
        `;
        resultDashBoard.innerHTML = html;
    },

    betStep1Component: function(money = '') {
        return `
            <div class="bet-input-wrapper position-relative">
                <input type="number" class="bet-input js-bet-input" value="${money}">
                <ul class="bet-fast-list">
                    <li data-value="1000000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+1000000</li>
                    <li data-value="500000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+500000</li>
                    <li data-value="100000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+100000</li>
                </ul>
            </div>
            <button class="btn btn-danger bet-button js-bet-button">Đặt cược</button>
        `;
    },

    betStep2Component: function(money) {
        return `
            <span class="bet-money">${money}</span>
            <button class="btn btn-success return-button js-return-button">Đặt lại</button>
        `;
    },

    navDashBoardComponent1: function() {
        return `
            <button class="btn btn-success text-uppercase js-start-button" disabled>Quất</button>
        `;
    },

    navDashBoardComponent2: function(inComeMoney) {
        if (inComeMoney > 0) {
            return `
                <button class="btn btn-success text-uppercase js-continue-button">Tiếp tục ăn không</button>
                <button class="btn btn-danger text-uppercase mt-2 m-auto d-block js-again-button">Oánh lại</button>
            `;
        }
        else if (inComeMoney === 0){
            return `
                <button class="btn btn-success text-uppercase js-continue-button">Chiến đấu tiếp</button>
                <button class="btn btn-danger text-uppercase mt-2 m-auto d-block js-again-button">Oánh lại</button>
            `;
        }
        else if (inComeMoney < 0){
            return `
                <button class="btn btn-success text-uppercase js-continue-button">Còn thở còn gỡ</button>
                <button class="btn btn-danger text-uppercase mt-2 m-auto d-block js-again-button">Oánh lại</button>
            `;
        }
        
    },

    random: function() {
        return Math.floor(Math.random() * 6);
    },

    save: function() {
        bautomStorage.set('countBet', arrCountBet);
        bautomStorage.set('countResult', arrCountResult);
        bautomStorage.set('history', arrHistory);
        moneyStorage.set('value', myMoney);
        app.myMoneyBefore = myMoney;
    },

    render: function() {
        app.renderHistory();
        app.renderCount();
    },

    run: function() {
        mainAudio.play();
        let html = '';
        app.runInterval = setInterval(() => {
            app.result1 = app.random();
            app.result2 = app.random();
            app.result3 = app.random();
            html = ` 
                <div class="col-4 position-relative">
                    <img src="${app.result[app.result1].img}" alt="" class="img-fluid">
                </div>
                <div class="col-4 position-relative">
                    <img src="${app.result[app.result2].img}" alt="" class="img-fluid">
                </div>
                <div class="col-4 position-relative">
                    <img src="${app.result[app.result3].img}" alt="" class="img-fluid">
                </div>
            `;
            resultDashBoard.innerHTML = html;
        }, app.timeInterval)
    },

    start: function() {
        app.render();
        app.renderResultUnstart();
        app.handleEvent();
    },
}

app.start();