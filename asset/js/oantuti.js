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

const oantutiStorage = createStorage('oantuti');
const moneyStorage = createStorage('money');

const userMoneyElem = _$('.js-user-money');
const menuBet = _$('.js-menu-bet');
const userHandSelectedContainer = _$('.js-user-selected-container');
const cptHandSelectedContainer = _$('.js-cpt-selected-container');
const userHandSelected = _$('.js-user-hand-selected');
const loseAudio = _$('.js-lose-audio');
const victoryAudio = _$('.js-victory-audio');

const arrHistory = oantutiStorage.get('history') ?? [];
const arrCountCptHand = oantutiStorage.get('cptHand') ?? new Array(3).fill(0);
const arrCountUserHand = oantutiStorage.get('userHand') ?? new Array(3).fill(0);

let myMoney = moneyStorage.get('value') || 999999;
userMoneyElem.innerHTML = myMoney;

const app = {

    betMoney: 0,
    hands: [
        '../asset/img/oantuti/keo.png',
        '../asset/img/oantuti/bua.png',
        '../asset/img/oantuti/bao.png',
    ],
    resultImage: [
        '../asset/img/oantuti/win.png',
        '../asset/img/oantuti/lose.png',
        '../asset/img/oantuti/hoa.png',
    ],
    userHandSelected: null,
    cptHandSelected: null,

    handleEvent: function() {

        menuBet.addEventListener('click', function(e) {
            const _this = e.target;
            const isBackButton = _this.closest('.js-bet-return-button');
            const isBetButton = _this.closest('.js-bet-confirm-button');
            const isAllinButton = _this.closest('.js-allin-button');
            const isStartButton = _this.closest('.js-start-button');
            const isContinueButton = _this.closest('.js-continue-button');
            const isBetFastButton = _this.closest('.js-bet-fast-button');

            //xử lí đặt cược
            if (isBetButton) {
                const betInput= _$('.js-bet-input')
                const value = Math.abs(+betInput.value);
                const isSelected = userHandSelectedContainer.classList.contains('selected')
                
                if (!value) {
                    alert('Chưa nhập tiền kìa bạn ey!');
                    return;
                } else if (!isSelected) {
                    alert('Chưa chọn tay kìa bạn ey!');
                    return;
                } else if(value > myMoney){
                    alert('Tiền ít đòi hít lol thơm à bạn ey!');
                    betInput.value = myMoney;
                    return;
                }
                app.betMoney = value;
                myMoney -= value;
                menuBet.innerHTML = app.menuBetStep2Component(value);
                userMoneyElem.innerHTML = myMoney;
            }

            //xử lí đặt lại
            else if (isBackButton) {
                myMoney += app.betMoney;
                userMoneyElem.innerHTML = myMoney;
                menuBet.innerHTML = app.menuBetStep1Component(app.betMoney);
            }
            
            //xử lí bắt đầu
            else if (isStartButton) {
                const random = Math.floor(Math.random() * 3);
                const cptHandSelectedImg = app.hands[random];

                app.cptHandSelected = random;
                cptHandSelectedContainer.innerHTML = app.handSelectedComponent(cptHandSelectedImg);
                app.xuLiKetThuc();
            } 
            
            //xử lí tiếp tục chơi
            else if (isContinueButton) {
                menuBet.innerHTML = app.menuBetStep1Component();
                userHandSelectedContainer.classList.remove('selected');
                userHandSelectedContainer.innerHTML = app.handUnSelectedComponent();
                cptHandSelectedContainer.innerHTML = app.handUnSelectedComponent();
            }

            //xử lí all in
            else if (isAllinButton) {
                const betInput= _$('.js-bet-input')
                betInput.value = myMoney;
            }

            //xử lí đặt nhanh
            else if (isBetFastButton) {
                const betInput = _$('.js-bet-input');
                const money = +_this.dataset.value;
                betInput.value = +betInput.value + money;
            }

        })

        //xử lí chọn tay
        const userHands = _$$('.js-user-hand');
        userHands.forEach((hand, index) => {
            hand.addEventListener('click', function() {
                const src = this.src;
                app.userHandSelected = index;
                userHandSelectedContainer.classList.add('selected');
                userHandSelectedContainer.innerHTML = app.handSelectedComponent(src);
            })
        })

        //show history mobile
        const history = _$('.js-history');
        const overlay = _$('.js-history-overlay');
        _$('.js-history-button').addEventListener('click', function() {
            history.classList.add('is-open');
            overlay.classList.toggle('d-none');
        })

        overlay.addEventListener('click', function() {
            overlay.classList.toggle('d-none');
            history.classList.remove('is-open');
        })
    },

    xuLiKetThuc: function() {
        let result;
        const now = new Date();
        const time = convertDate(now).time;
        const date = convertDate(now).date;
        const userHand = app.userHandSelected;
        const cptHand = app.cptHandSelected;
        const money = app.betMoney;

        if (userHand === cptHand) {
            result = 2;
        }else {
            switch(userHand) {
                case 0:
                    if (cptHand === 1) result = 1;
                    else if (cptHand === 2) result = 0;
                    break;
    
                case 1:
                    if (cptHand === 0) result = 0;
                    else if (cptHand === 2) result = 1;
                    break;
    
                case 2:
                    if (cptHand === 0) result = 1;
                    else if (cptHand === 1) result = 0;
                    break;
            }
        }

        if (result === 0) {
            app.betMoney *= 2;
            myMoney += app.betMoney;
            userMoneyElem.innerHTML = myMoney;
            victoryAudio.play();
        } 
        else if (result === 1) {
            loseAudio.play();
        } 
        else if (result === 2) {
            myMoney += app.betMoney;
            userMoneyElem.innerHTML = myMoney;
        }

        menuBet.innerHTML = app.menuBetStep3Component(result, app.betMoney);
        arrHistory.splice(0, 0, { userHand, cptHand, money, result, time, date });
        
        if (arrHistory.length > 10) arrHistory.length = 10;
        
        arrCountUserHand[userHand]++;
        arrCountCptHand[cptHand]++;
        app.save();
        app.render();
    },
    
    renderCountHand: function() {
        const userHands = _$$('.js-count-user-selected');
        const cptHands = _$$('.js-count-cpt-selected');
        arrCountUserHand.forEach((i, index) => {
            userHands[index].innerText = i;
        })
        arrCountCptHand.forEach((i, index) => {
            cptHands[index].innerText = i;
        })
    },

    renderHistory: function() {
        const historyContainer = _$('.history-body');
        _$('.js-count').innerHTML = arrCountCptHand.reduce((a, b) => a + b);
        
        function checkResult(result, money) {
            if (result === 0){
                return `<span class="text-success d-block">+${money}</span>`;
            }else if (result === 1) {
                return `<span class="text-danger d-block">-${money}</span>`;
            } else if (result === 2) {
                return `<span class="text-success d-block">+0</span>`;
            }
        };

        const html = arrHistory.map((i, index) => {
            return `
                <div class="history-item">
                    <div class="p-2">
                        <img class="img-fluid" src="${app.hands[i.userHand]}" alt="">
                        <span>Bạn</span>
                    </div>

                    <div class="p-2">
                        <span class="d-block" style="font-size: 12px;">#${index + 1}</span>
                        <img class="img-fluid" src="${app.resultImage[i.result]}" alt="">
                        ${checkResult(i.result, i.money)}
                        <span class="d-block" style="font-size: 12px;">${i.time}</span>
                        <span class="d-block" style="font-size: 12px;">${i.date}</span>
                    </div>

                    <div class="p-2">
                        <img class="img-fluid" src="${app.hands[i.cptHand]}" alt="">
                        <span>Máy</span>
                    </div>
                </div>
            `
        }).join('');
        historyContainer.innerHTML = html;
    },

    handSelectedComponent: function(src) {
        return `
            <img class="img-fluid" src="${src}" alt="">
        `;
    },

    handUnSelectedComponent: function() {
        return `
            <img class="img-fluid img-unselect" src="../asset/img/oantuti/keo.png" alt="">
            <img class="img-fluid logo-dau-hoi" src="../asset/img/oantuti/dauhoi.png" alt="">
        `;
    },

    menuBetStep1Component: function(money = '') {
        return `
            <h5 class="bet-title">Đặt cược</h5>
            <div class="bet-input-wrapper position-relative">
                <input type="number" class="bet-input js-bet-input" value="${money}">
                <ul class="bet-fast-list">
                    <li data-value="1000000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+1000000</li>
                    <li data-value="500000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+500000</li>
                    <li data-value="100000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+100000</li>
                </ul>
            </div>
            <div>
                <button class="btn btn-success m-auto mt-2 js-bet-confirm-button">Xác nhận</button>
                <button class="btn btn-danger m-auto mt-2 js-allin-button">All in</button>
            </div>
        `;
    },

    menuBetStep2Component: function(money) {
        return `
            <h5>Đã cược: <span class="bet-money js-bet-money">${money}</span></h5>
            <button class="btn btn-danger js-start-button">Chiến đấu</button>
            <button class="btn btn-success js-bet-return-button">Đặt lại</button>
        `;
    },

    menuBetStep3Component: function(result, inComeMoney) {
        
        const thang = `
            <img style="height: 40px;" src="../asset/img/oantuti/win.png" alt="">
            <h5>Khá lắm !! <span class="text-success">+${inComeMoney / 2}</span></h5>
            <button class="btn btn-success js-continue-button">Tiếp tục bán hành</button>
        `;
        const thua = `
            <img style="height: 40px;" src="../asset/img/oantuti/lose.png" alt="">
            <h5>Thua rùi 
            <span class="text-danger">Lêu Lêu</span>
            , non lắm !
            <span class="text-danger">-${inComeMoney}</span>
            </h5>
            <button class="btn btn-success js-continue-button">Còn thở còn gỡ</button>
        `;
        const hoa = `
            <img style="height: 60px;" src="../asset/img/oantuti/hoa.png" alt="">
            <h5>Măng Măng ! <span class="text-success">+0</span></h5>
            <button class="btn btn-success js-continue-button">Chiến đấu tiếp</button>
        `;

        switch (result) {  
            case 0: 
                return thang;
                break;

            case 1: 
                return thua;
                break;

            case 2: 
                return hoa;
                break;
        }
    },

    save: function() {
        oantutiStorage.set('history', arrHistory);
        oantutiStorage.set('userHand', arrCountUserHand);
        oantutiStorage.set('cptHand', arrCountCptHand);
        moneyStorage.set('value', myMoney);
    },

    render: function() {
        app.renderHistory();
        app.renderCountHand();
    },

    start: function() {
        app.render();
        app.handleEvent();
    },
}

app.start();