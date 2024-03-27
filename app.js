const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
const db_path = path.join(__dirname, 'moviesData.db')

app.use(express.json())
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieDbObjectToResponceObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponceObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

///GET movie name

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT movie_name
  FROM movie;`
  const movieList = await db.all(getMoviesQuery)
  response.send(movieList.map(eachMovie => ({movieName: eachMovie.movie_name})))
})

///POST movie

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO 
    movie ( director_id, movie_name, lead_actor)
  VALUES 
    ( ${directorId}, '${movieName}', '${leadActor}');`
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

///GET movie by ID

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieByIdQuery = `
  SELECT
    *
  FROM
    movie
  WHERE 
    movie_id = ${movieId};`
  const result = await db.get(getMovieByIdQuery)
  response.send(convertMovieDbObjectToResponceObject(result))
})

///PUT movie by ID

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putMovieByIdQuery = `
  UPDATE movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`
  await db.run(putMovieByIdQuery)
  response.send('Movie Details Updated')
})

///DELETE movie by ID

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteByIdQuery = `
  DELETE FROM
    movie
  WHERE movie_id = ${movieId};`
  await db.run(deleteByIdQuery)
  response.send('Movie Removed')
})

///GET directors

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT *
  FROM director;`
  const directorList = await db.all(getDirectorsQuery)
  response.send(
    directorList.map(eachDirector =>
      convertDirectorDbObjectToResponceObject(eachDirector),
    ),
  )
})

///GET movie name by director id

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getByDirectorId = `
  SELECT
    movie_name
  FROM 
    movie
  WHERE 
    director_id = ${directorId};`
  const result = await db.all(getByDirectorId)
  response.send(result.map(eachMovie => ({movieNe: eachMovie.movie_name})))
})

module.exports = app
