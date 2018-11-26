/**
 * GroupedBarViz - Object constructor function
 * @param _parentElement - the HTML element in which to draw the bar charts
 * @param _data
 **/
GroupedBarViz = function(_parentElement, _data) {
  this.parentElement = _parentElement
  this.originalData = _data
  this.data = _data
  this.displayData = []

  this.initVis()
}

GroupedBarViz.prototype.initVis = function() {
  const vis = this

  vis.loaded = false
  vis.margin = { top: 20, right: 110, bottom: 60, left: 110 }
  vis.width = $('.right-column').width() - vis.margin.left - vis.margin.right
  vis.height = 200 - vis.margin.top - vis.margin.bottom
  vis.svg = d3
    .select(vis.parentElement)
    .append('svg')
    .attr('width', vis.width + vis.margin.left + vis.margin.right)
    .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
    .append('g')
    .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`)

  vis.wrangleData()
}

GroupedBarViz.prototype.wrangleData = function() {
  const vis = this

  console.log(vis.data)

  vis.displayData = vis.data.map((data, index) => {
    const year = moment().year(parseInt(data.Year)).toDate()
    const gunControl = data['Gun Control'].replace('$', '').replace(',', '')
    const gunRights = data['Gun Rights'].replace('$', '').replace(',', '')
    const gunManufacturing = data['Gun Manufacturing'].replace('$', '').replace(',', '')
    return {
      key: index,
      year,
      gunControl,
      gunRights,
      gunManufacturing
    }
  })

  vis.displayData.sort((a, b) => {
    if (a.year < b.year) {
      return 1
    }
    if (a.year > b.year) {
      return -1
    }
    return 0
  })

  // Update the visualization
  vis.updateVis()
}

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

GroupedBarViz.prototype.updateVis = function() {
  const vis = this

  vis.xScale = d3.scaleBand()
    .rangeRound([0, vis.width])
    .paddingInner(0.1)

  vis.yScale = d3.scaleLinear()
    .rangeRound([d3.max([...vis.displayData.map(v => v.gunControl), ...vis.displayData.map(v => v.gunRights)]), 0])

  vis.xAxis = d3.axisBottom(vis.xScale)
  vis.yAxis = d3.axisLeft(vis.yScale)

  const g = vis.svg
    .selectAll('g')
    .data(vis.displayData, d => d.key)
    .enter()
    .append('g')

  g
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => vis.xScale(d.gunControl))
    .attr('y', d => vis.yScale(d.gunControl))
    .attr('width', () => vis.xScale.bandwidth())
    .attr('height', vis.yScale.bandwidth())

  vis.svg
    .append('g')
    .attr('class', 'x-axis')
    .call(vis.xAxis)

  vis.svg
    .append('g')
    .attr('class', 'y-axis')
    .call(vis.yAxis)

  vis.loaded = true
}
