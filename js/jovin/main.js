let gunLawMap

async function getGunLawData() {
  const [data2014, data2015, data2016, data2017] = await Promise.all([
    new Promise(resolve => {
      d3.csv('data/jovin/gunlaw-scorecard-2014.csv', resolve)
    }),
    new Promise(resolve => {
      d3.csv('data/jovin/gunlaw-scorecard-2015.csv', resolve)
    }),
    new Promise(resolve => {
      d3.csv('data/jovin/gunlaw-scorecard-2016.csv', resolve)
    }),
    new Promise(resolve => {
      d3.csv('data/jovin/gunlaw-scorecard-2017.csv', resolve)
    })
  ])
  return {
    data2014,
    data2015,
    data2016,
    data2017
  }
}

async function getGunViolenceData() {
  const [gunViolenceData] = await Promise.all([
    new Promise(resolve => {
      d3.json('data/jovin/gun-violence.json', resolve)
    })
  ])
  return {
    gunViolenceData
  }
}

async function getMapData() {
  const [usTopoJSON, stateNames] = await Promise.all([
    new Promise(resolve => {
      d3.json('data/jovin/us-topo.json', resolve)
    }),
    new Promise(resolve => {
      d3.tsv('data/jovin/us-state-names.tsv', resolve)
    })
  ])
  return {
    usTopoJSON,
    stateNames
  }
}

async function initializeGunLawMap() {
  const { data2014, data2015, data2016, data2017 } = await getGunLawData()
  const { gunViolenceData } = await getGunViolenceData()
  const { usTopoJSON, stateNames } = await getMapData()
  gunLawMap = new GunLawMap('#gunLawMap', '#gunLawLegend', usTopoJSON, stateNames, { data2014, data2015, data2016, data2017 }, gunViolenceData, displayStateGunStats)
}

initializeGunLawMap()
  .then(() => console.log('complete'))
  .catch(console.error)

let currentYear = 2014
let yearLoop = null

function selectYear(year) {
  currentYear = parseInt(year, 10)
  if (currentYear > 2017) {
    currentYear = 2014
  }
  $('.gunLaw-container .year').removeClass('active')
  $(`.gunLaw-container .year.${currentYear}`).addClass('active')
  if (gunLawMap) {
    gunLawMap.setYear(currentYear)
    gunLawMap.wrangleData()
  }
}

function startYearLoop() {
  yearLoop = setInterval(() => {
    selectYear(currentYear)
    currentYear++
  }, 5000)
}

function pauseYearLoop() {
  if (yearLoop) {
    clearInterval(yearLoop)
    yearLoop = null
  }
}

function hidePauseButton() {
  $('.play-pause.pause').css({
    display: 'none'
  })
}

function showPauseButton() {
  $('.play-pause.pause').css({
    display: 'inline-block'
  })
}

function hidePlayButton() {
  $('.play-pause.play').css({
    display: 'none'
  })
}

function showPlayButton() {
  $('.play-pause.play').css({
    display: 'inline-block'
  })
}

const displayStateGunStats = (data) => {
  const $rightColumn = $('.gunLaw-container .columns .right-column')
  $rightColumn.css('visibility', 'visible')
  $rightColumn.find('.name').text(data.name)
  $rightColumn.find('.table.2014 tr.grade .value').text(data[2014].grade)
  $rightColumn.find('.table.2014 tr.gun_law_rank .value').text(data[2014].gun_law_rank)
  $rightColumn.find('.table.2014 tr.gun_deaths_rank .value').text(data[2014].gun_deaths_rank)
  $rightColumn.find('.table.2015 tr.grade .value').text(data[2015].grade)
  $rightColumn.find('.table.2015 tr.gun_law_rank .value').text(data[2015].gun_law_rank)
  $rightColumn.find('.table.2015 tr.gun_deaths_rank .value').text(data[2015].gun_deaths_rank)
  $rightColumn.find('.table.2016 tr.grade .value').text(data[2016].grade)
  $rightColumn.find('.table.2016 tr.gun_law_rank .value').text(data[2016].gun_law_rank)
  $rightColumn.find('.table.2016 tr.gun_deaths_rank .value').text(data[2016].gun_deaths_rank)
  $rightColumn.find('.table.2017 tr.grade .value').text(data[2017].grade)
  $rightColumn.find('.table.2017 tr.gun_law_rank .value').text(data[2017].gun_law_rank)
  $rightColumn.find('.table.2017 tr.gun_deaths_rank .value').text(data[2017].gun_deaths_rank)
}

$(document).ready(function() {
  // gun icons
  (async () => {
    await new Promise(async resolve => {
      for (const el of $('.gunQuestions-container .portions .gun-icon').slice(0, 8)) {
        $(el).addClass('covered')
        await new Promise(resolve => {
          setTimeout(resolve, 500)
        })
      }
      $('.gunQuestions-container .portions p.actual-number').css('visibility', 'visible')
      resolve()
    })
    await new Promise(async resolve => {
      for (const el of $('.gunQuestions-container .prevalent-guns .gun-icon').slice(0, 8).get().reverse()) {
        $(el).addClass('covered')
        await new Promise(resolve => {
          setTimeout(resolve, 500)
        })
      }
      $('.gunQuestions-container .prevalent-guns .actual-number').css('visibility', 'visible')
      resolve()
    })
  })()

  // map years
  selectYear(2014)
  currentYear++
  startYearLoop()

  $('.gunLaw-container .year').hover(function() {
    pauseYearLoop()
    selectYear($(this).attr('year'))
  }, function() {
    currentYear++
    startYearLoop()
  })

  // slider
  const slider = document.getElementById('numberOfDeaths')
  const output = document.getElementById('sliderValue')
  output.innerHTML = slider.value
  slider.oninput = function() {
    output.innerHTML = this.value
    if (gunLawMap) {
      gunLawMap.setNKilled(parseInt(this.value, 10))
    }
  }

  // play pause
  $('.play-pause.play').click(function() {
    startYearLoop()
    hidePlayButton()
    showPauseButton()
  })

  $('.play-pause.pause').click(function() {
    pauseYearLoop()
    hidePauseButton()
    showPlayButton()
  })

  showPauseButton()
  hidePlayButton()
})
