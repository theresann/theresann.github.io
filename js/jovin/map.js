GunLawMap = function(_mapParentElement, _legendParentElement, _usTopoJSON, _stateNames, _gunLawData, _gunViolenceData, displayStateGunStats) {
  const vis = this
  this.parentElement = _mapParentElement
  this.legendElement = _legendParentElement
  this.usTopoJSON = _usTopoJSON
  this.stateNames = _stateNames
  this.stateNameIdMap = {}
  this.idStateNameMap = {}
  this.interval = null
  this.displayStateGunStats = displayStateGunStats

  for (let i = 0; i < _stateNames.length; i++) {
    this.stateNameIdMap[_stateNames[i].name] = _stateNames[i].id
    this.idStateNameMap[_stateNames[i].id] = _stateNames[i].name
  }

  this.originalGunViolence = _gunViolenceData
  this.gunViolenceMap = this.originalGunViolence.reduce((prev, v) => {
    const gunDate = moment(v.date).format('YYYY-MM')
    if (!prev.hasOwnProperty(gunDate)) {
      prev[gunDate] = {}
    }
    const state = v.state
    const stateId = vis.stateNameIdMap[state]
    if (!prev[gunDate].hasOwnProperty(stateId)) {
      prev[gunDate][stateId] = 0
    }
    prev[gunDate][stateId] = prev[gunDate][stateId] + parseInt(v.n_killed, 10)
    return prev
  }, {})
  this.originalGunLawData = _gunLawData
  this.focusedGunLawData = undefined
  this.state = {
    n_killed: 14,
    year: 2014,
    date: moment().month('January').startOf('month').year(2014)
  }

  this.initVis()
  this.startInterval()
}

GunLawMap.prototype.setYear = function(year) {
  this.state.year = year
  this.state.date = moment().month('January').startOf('month').year(year)
}

GunLawMap.prototype.setNKilled = function(n_killed) {
  this.state.n_killed = n_killed
}

GunLawMap.prototype.getStateStats = function(state) {
  const vis = this
  const state2014 = vis.originalGunLawData.data2014
    .filter(s => s.state.trim() === state)[0]
  const state2015 = vis.originalGunLawData.data2015
    .filter(s => s.state.trim() === state)[0]
  const state2016 = vis.originalGunLawData.data2016
    .filter(s => s.state.trim() === state)[0]
  const state2017 = vis.originalGunLawData.data2017
    .filter(s => s.state.trim() === state)[0]

  const data_2014 = {
    grade: state2014.grade.trim(),
    gun_law_rank: parseInt(state2014.gun_law_strength.trim(), 10),
    gun_deaths_rank: parseInt(state2014.gun_death_rate.trim(), 10)
  }
  const data_2015 = {
    grade: state2015.grade.trim(),
    gun_law_rank: parseInt(state2015.gun_law_strength.trim(), 10),
    gun_deaths_rank: parseInt(state2015.gun_death_rate.trim(), 10)
  }
  const data_2016 = {
    grade: state2016.grade.trim(),
    gun_law_rank: parseInt(state2016.gun_law_strength.trim(), 10),
    gun_deaths_rank: parseInt(state2016.gun_death_rate.trim(), 10)
  }
  const data_2017 = {
    grade: state2017.grade.trim(),
    gun_law_rank: parseInt(state2017.gun_law_strength.trim(), 10),
    gun_deaths_rank: parseInt(state2017.gun_death_rate.trim(), 10)
  }

  return {
    name: state.toString(),
    2014: data_2014,
    2015: data_2015,
    2016: data_2016,
    2017: data_2017
  }
}

GunLawMap.prototype.startInterval = function() {
  const vis = this
  if (vis.interval) {
    clearInterval(vis.interval)
  }
  vis.interval = setInterval(() => {
    if (vis.state.date.date() === 31 && vis.state.date.month() === 12) {
      return
    }
    vis.state.date = vis.state.date.add(1, 'days')
    vis.wrangleData()
  }, 5000 / 365)
}

GunLawMap.prototype.quantifyGrade = function(grade) {
  switch (grade) {
    case 'A+':
      return 5
    case 'A':
      return 5
    case 'A-':
      return 5
    case 'B+':
      return 4
    case 'B':
      return 4
    case 'B-':
      return 4
    case 'C+':
      return 3
    case 'C':
      return 3
    case 'C-':
      return 3
    case 'D+':
      return 2
    case 'D':
      return 2
    case 'D-':
      return 2
    case 'E+':
      return 1
    case 'E':
      return 1
    case 'E-':
      return 1
    case 'F+':
      return 0
    case 'F':
      return 0
    case 'F-':
      return 0
    default:
      throw new Error(`unknown grade ${grade}`)
  }
}

GunLawMap.prototype.initVis = function() {
  const vis = this

  vis.margin = { top: 20, right: 20, bottom: 20, left: 20 }
  vis.width = 600 - vis.margin.left - vis.margin.right
  vis.height = 400 - vis.margin.top - vis.margin.bottom
  vis.svg = d3
    .select(vis.parentElement)
    .append('svg')
    .attr('width', vis.width + vis.margin.left + vis.margin.right)
    .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
    .append('g')
    .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`)

  vis.legendVis = {}
  vis.legendVis.margin = { top: 20, right: 20, bottom: 20, left: 20 }
  vis.legendVis.width = 150 - vis.legendVis.margin.left - vis.legendVis.margin.right
  vis.legendVis.height = 120 - vis.legendVis.margin.top - vis.legendVis.margin.bottom
  vis.legendVis.svg = d3
    .select(vis.parentElement)
    .append('svg')
    .attr('class', 'legend')
    .attr('width', vis.legendVis.width + vis.legendVis.margin.left + vis.legendVis.margin.right)
    .attr('height', vis.legendVis.height + vis.legendVis.margin.top + vis.legendVis.margin.bottom)
    .append('g')

  vis.wrangleData()
}

GunLawMap.prototype.wrangleData = function() {
  const vis = this
  const gunDate = moment(vis.state.date).format('YYYY-MM')

  switch (vis.state.year) {
    case 2014:
      vis.focusedGunLawData = vis.originalGunLawData.data2014
        .map(row => ({
          grade: row.grade.trim(),
          value: vis.quantifyGrade(row.grade.trim()),
          key: `2014-${row.state.trim()}`,
          year: 2014,
          gun_law_strength_rank: parseInt(row.gun_law_strength.trim(), 10),
          state: row.state.trim(),
          stateId: Number(vis.stateNameIdMap[row.state.trim()]),
          gun_death_rate_rank: parseInt(row.gun_death_rate.trim(), 10),
          n_killed: vis.gunViolenceMap[gunDate] && vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] ? vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] : 0
        }))
      break
    case 2015:
      vis.focusedGunLawData = vis.originalGunLawData.data2015
        .map(row => ({
          grade: row.grade.trim(),
          value: vis.quantifyGrade(row.grade.trim()),
          key: `2015-${row.state.trim()}`,
          year: 2015,
          gun_law_strength_rank: parseInt(row.gun_law_strength.trim(), 10),
          state: row.state.trim(),
          stateId: Number(vis.stateNameIdMap[row.state.trim()]),
          gun_death_rate_rank: parseInt(row.gun_death_rate.trim(), 10),
          n_killed: vis.gunViolenceMap[gunDate] && vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] ? vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] : 0
        }))
      break
    case 2016:
      vis.focusedGunLawData = vis.originalGunLawData.data2016
        .map(row => ({
          grade: row.grade.trim(),
          value: vis.quantifyGrade(row.grade.trim()),
          key: `2016-${row.state.trim()}`,
          year: 2016,
          gun_law_strength_rank: parseInt(row.gun_law_strength.trim(), 10),
          state: row.state.trim(),
          stateId: Number(vis.stateNameIdMap[row.state.trim()]),
          gun_death_rate_rank: parseInt(row.gun_death_rate.trim(), 10),
          n_killed: vis.gunViolenceMap[gunDate] && vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] ? vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] : 0
        }))
      break
    case 2017:
      vis.focusedGunLawData = vis.originalGunLawData.data2017
        .map(row => ({
          grade: row.grade.trim(),
          value: vis.quantifyGrade(row.grade.trim()),
          key: `2017-${row.state.trim()}`,
          year: 2017,
          gun_law_strength_rank: parseInt(row.gun_law_strength.trim(), 10),
          state: row.state.trim(),
          stateId: Number(vis.stateNameIdMap[row.state.trim()]),
          gun_death_rate_rank: parseInt(row.gun_death_rate.trim(), 10),
          n_killed: vis.gunViolenceMap[gunDate] && vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] ? vis.gunViolenceMap[gunDate][Number(vis.stateNameIdMap[row.state.trim()])] : 0
        }))
      break
    default:
      throw new Error(`unknown year ${vis.state.year}`)
  }

  vis.updateVis()
}

GunLawMap.prototype.updateVis = function() {
  const vis = this

  const colorScale = d3
    .scaleLinear()
    .domain([0, 1, 2, 3, 4, 5])
    // .range([d3.rgb('#feb24c'), d3.rgb('#b10026')])
    .range(['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'])

  function scale(scaleFactor) {
    return d3.geoTransform({
      point: function(x, y) {
        this.stream.point(x * scaleFactor, y * scaleFactor)
      }
    })
  }

  const path = d3.geoPath()
    .projection(scale(0.6))

  const theStates = topojson.feature(vis.usTopoJSON, vis.usTopoJSON.objects.states).features

  function getGunDataForStateId(id) {
    return vis.focusedGunLawData.filter(d => d.stateId === Number(id))[0]
  }

  const mapSelection = vis
    .svg
    .selectAll('path')
    .data(theStates, d => d.key)

  mapSelection
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'states')
    .style('stroke', '#fff')
    .style('stroke-width', '1')
    .style('fill', d => {
      const data = getGunDataForStateId(d.id)
      if (!data) {
        return 'black'
      }
      if (data.n_killed > vis.state.n_killed) {
        return 'red'
      }
      return colorScale(data.value)
    })
    .on('mouseover', d => {
      const data = getGunDataForStateId(d.id)
      if (!data) {
        return
      }
      return vis.displayStateGunStats(vis.getStateStats(data.state))
    })

  mapSelection
    .attr('d', path)
    .attr('class', 'states')
    .style('stroke', '#fff')
    .style('stroke-width', '1')
    .style('fill', d => {
      const data = getGunDataForStateId(d.id)
      if (!data) {
        return 'black'
      }
      return colorScale(data.value)
    })
    .on('mouseover', d => {
      const data = getGunDataForStateId(d.id)
      if (!data) {
        return
      }
      return vis.displayStateGunStats(data.state)
    })

  mapSelection
    .exit()
    .remove()

  const gradeSelection = vis
    .svg
    .selectAll('text.grade')
    .data(theStates, d => d.key)

  gradeSelection
    .enter()
    .append('text')
    .attr('transform', d => `translate(${path.centroid(d)})`)
    .attr('class', 'grade')
    .text(d => {
      const data = getGunDataForStateId(d.id)
      if (!data) {
        return '-'
      }
      return data.grade
    })

  gradeSelection
    .attr('transform', d => `translate(${path.centroid(d)})`)
    .attr('class', 'grade')
    .text(d => {
      const data = getGunDataForStateId(d.id)
      if (!data) {
        return '-'
      }
      return data.grade
    })

  gradeSelection
    .exit()
    .remove()

  const legend = vis
    .legendVis
    .svg
    .selectAll('g')
    .data(colorScale.domain().slice().reverse())

  const legendSelection = legend
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0,${i * 20})`)

  legendSelection.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', colorScale)
    .style('stroke', 'white')

  legendSelection.append('text')
    .data(['Grade A (Strict)', 'Grade B', 'Grade C', 'Grade D', 'Grade E', 'Grade F (Loose)'])
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .attr('stroke', 'white')
    .attr('fill', 'white')
    .text(d => {
      return d
    })
}
