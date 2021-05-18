const baseUrl = "https://lighthouse-user-api.herokuapp.com/api/v1/users"
const container = document.querySelector('.container')
const cards = document.querySelector('.cards')
const body = document.querySelector('body')
const generalData = []
let pairStatus = []
let gameSize = 0
let tryCount = 0
let score = 0 

const gameState = {
  gameSizeWait : 'size',
  waitFirstCard : 'firstCard',
  waitSecondCard : 'secondCard',
  gameReset : 'gameReset',
}

const view = {
  //傳入隨機資料(陣列)
  renderAllCards (gameSize, ...arr) {
    const data = [...arr]
    const size = gameSize === 12? 'small': gameSize === 24? 'medium': 'large'
    cards.innerHTML = ''
    data.forEach(item => {
      return cards.innerHTML += `
        <div class="card ${size}">
          <img class="avatar ${item.gender}" src="${item.avatar}" alt="">
          <img class="background" src="https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/9222/ExportedContentImage_00.png" alt="" data-id="${item.id}">
        </div>
      `
    })       
  },

  //依照判斷結果顯示翻牌
  matchCheckAndFlip () {
    let booleanValue = pairStatus[0].dataset.id === pairStatus[1].dataset.id ? true : false
    if (!booleanValue) {
      this.renderWrongAnimation()
      
      controller.currentState = gameState.waitFirstCard
    } else {
      this.renderScoreAndWin(booleanValue)
    } 
    pairStatus = []
  },

  flipCard (target) {
    target.style.visibility = 'hidden'
    pairStatus.push(target)
  },

  renderScoreAndWin (booleanValue) {
    if (booleanValue) {
      score += 10
      document.querySelector('.score').innerHTML = `分數 : ${score}`
    }
    if (score === gameSize * 10 / 2) {
      let modal = document.createElement('div')
      modal.classList = 'modalContainer'
      modal.innerHTML = `
      <div class="modalBox">
        <p class="winModal">恭喜你完成了 點擊畫面任何地方繼續</p>
      </div>
      `
      body.insertBefore(modal, container)
      controller.currentState = gameState.gameReset
      document.querySelector('.modalContainer').addEventListener('click', event => {
        document.querySelector('.modalContainer').remove()
      })
    } else {
      controller.currentState = gameState.waitFirstCard
    }
  },

  renderCount () {
    tryCount += 1
    document.querySelector('.triedTimes').innerHTML = `嘗試次數 : ${tryCount}`
  },

  renderWrongAnimation() {
    pairStatus.map(item => {
      target = item.parentElement.children[0]
      target.classList.add('wrong')
      target.addEventListener('animationend', event => {
        event.target.classList.remove('wrong')
        item.style.visibility = 'visible'
      }, { once: true })
    })
  }
}

const model = {
  //取全部資料 寫入generalData
  getGeneralData(baseUrl) {
    axios.get(baseUrl)
    .then(res => {
      generalData.push(...res.data.results)
    })
    .catch(err => {
      console.log(err)
    })
  },

  //透過亂數陣列產生隨機資料 回傳陣列
  getRenderData(gameSize) {
    let data = generalData.slice(0, gameSize / 2)
    let randomNum = utility.getRandomNumberArray(gameSize)
    data = data.concat(data)
    return randomNum.map(item => data[item])
  }
}

const utility = {
  //產生亂數陣列
  getRandomNumberArray(gameSize) {
    const number = Array.from(Array(gameSize).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState : gameState.gameSizeWait,

  gameProcess(target) {
    if (target.classList.contains('retry')) {
      this.currentState = gameState.gameReset
    }
    switch (this.currentState) {
      case gameState.gameSizeWait:
        if (!target.classList.contains('start')) {
          return
        }
        gameSize = Number(document.querySelector('select').value)
        view.renderAllCards(gameSize, ...model.getRenderData(gameSize))
        this.currentState = gameState.waitFirstCard
        break

      case gameState.waitFirstCard:
        if (!target.classList.contains('background')) {
          return
        }
        view.flipCard(target)
        view.renderCount()
        this.currentState = gameState.waitSecondCard
        break

      case gameState.waitSecondCard:
        if (!target.classList.contains('background')) {
          return
        }
        view.flipCard(target)
        view.matchCheckAndFlip()
        view.renderCount()
        break
      
      case gameState.gameReset:
        cards.innerHTML = ''
        document.querySelector('.score').innerHTML = '分數 : '
        document.querySelector('.triedTimes').innerHTML = '嘗試次數 : '
        this.currentState = gameState.gameSizeWait
        pairStatus = []
        gameSize = 0
        tryCount = 0
        score = 0
    }
  }
}

model.getGeneralData(baseUrl)
document.querySelector('.container').addEventListener('click', event => {
  let target = event.target
  controller.gameProcess(target)
})