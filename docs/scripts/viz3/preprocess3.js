/**
 * Removes all data that do not concern the whole of Quebec
 *
 * @param {Array} data the data to filter
 * @returns {Array} the data filtered
 */
export function filterRegion (data) {
  data = data.filter(element => element.Nom_Region.indexOf('Ensemble') !== -1)
  return data
}

/**
 * Gets the list of the differents skills
 *
 * @param {Array} data the data
 * @returns {Array} The array containing the names of the skills
 */
export function getSkills (data) {
  const skills = []
  data.forEach((element) => {
    const nbName = element.Genre_de_competences.trim()
    const nbCheck = skills.includes(nbName)
    if (!nbCheck) {
      skills.push(nbName)
    }
  })
  return skills
}

/**
 * Structure the data format
 *
 * @param {Array} data The data
 * @param {Array} skills List of the skills
 * @returns {Array} The data formated
 */
export function structureData (data, skills) {
  var newData = []
  var skillLevels = ['Haut. Qualifié', 'Qualifié', 'Moins Qualifié']
  var skillDetection = { 'Haut. Qualifié': 'Haut', Qualifié: '(Qual', 'Moins Qualifié': 'Moins' }

  skills.forEach(skill => {
    var dataWithThisSkill = data.filter(element => element.Genre_de_competences.trim() === skill)
    var pourcentages = calculatePercentage(dataWithThisSkill)
    var total = pourcentages['Haut. Qualifié'] + pourcentages.Qualifié + pourcentages['Moins Qualifié']
    skillLevels.forEach(skillLevel => {
      var skillElement = { 'Genre de compétences': skill }
      var dataWithThisSkillLevel = dataWithThisSkill.filter(element => element.Niveau_de_competences.indexOf(skillDetection[skillLevel]) !== -1)
      skillElement.déficit = calculateDeficit(dataWithThisSkillLevel)
      skillElement.pourcentage = pourcentages[skillLevel] / total
      skillElement.emploi_estimé = pourcentages[skillLevel]
      skillElement.niveau_de_competences = skillLevel
      newData.push(skillElement)
    })
  })
  return newData
}

/**
 * Calculate the percentage for each skill level
 *
 * @param {Array} dataWithOneSkill the data to structure
 * @returns {*} an object with the percentage for each skill level
 */
export function calculatePercentage (dataWithOneSkill) {
  var percentages = { 'Haut. Qualifié': 0, Qualifié: 0, 'Moins Qualifié': 0 }
  dataWithOneSkill.forEach(element => {
    if (element.Niveau_de_competences.indexOf('Haut') !== -1) {
      percentages['Haut. Qualifié'] += parseInt(element.emploi_estime)
    }
    if (element.Niveau_de_competences.indexOf('(Qual') !== -1) {
      percentages.Qualifié += parseInt(element.emploi_estime)
    }
    if (element.Niveau_de_competences.indexOf('Moins') !== -1) {
      percentages['Moins Qualifié'] += parseInt(element.emploi_estime)
    }
  })

  return percentages
}

/**
 * Calculate the deficit for a skill
 *
 * @param {Array} dataWithOneSkill the data to structure
 * @returns {string} the term that best defines the deficit
 */
export function calculateDeficit (dataWithOneSkill) {
  if (dataWithOneSkill.length === 0) { return 'Equilibre' }
  var deficit = 0
  var countNonPublished = 0
  dataWithOneSkill.forEach(element => {
    if (element.Perspectives.indexOf('urplus') !== -1) { deficit += 1 }
    if (element.Perspectives.indexOf('ger D') !== -1) { deficit -= 1 }
    if (element.Perspectives === 'Deficit') { deficit -= 2 }
    if (element.Perspectives === 'Deficit important') { deficit -= 3 }
    if (element.Perspectives.indexOf('Non') !== -1) { countNonPublished += 1 }
  })
  deficit = deficit / (dataWithOneSkill.length - countNonPublished)
  return deficitScore(deficit)
}

/**
 * Give the deficit for a score
 *
 * @param {number} score the score
 * @returns {string} deficit
 */
export function deficitScore (score) {
  if (score < -1.25) { return 'Déficit' }
  if (score < -0.50) { return 'Léger Déficit' }
  if (score < 0.40) { return 'Equilibre' }
  return 'Léger Surplus'
}

/**
 * Give the percentage for the same skill level for the other year and for a given skill level
 *
 * @param {Array} skills the different skills
 * @param {Array} data the data from 2021
 * @returns {*} an object containing every percentage
 */
export function getCorrespondingPercentage (skills, data) {
  var output = {}
  skills.forEach(skill => {
    data.forEach(element => {
      console.log(element)
      if (element['Genre de compétences'] === skill) {
        output[skill] = element.pourcentage
      }
    })
  })
  return output
}
