const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;

const intiliazeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`db error:${error.message}`);
    process.exit(1);
  }
};
intiliazeDbandServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//api 1 get movies //

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM Movie;
    `;
  const getResult = await db.all(getMoviesQuery);
  response.send(
    getResult.map((eachplayer) => convertDbObjectToResponseObject(eachplayer))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
    INSERT INTO Movie (director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},'${movieName}','${leadActor}'
    )
    `;
  const postResult = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

const ConvertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailQuery = `
    SELECT * FROM Movie WHERE movie_id = ${movieId}
    `;
  const getResultMovie = await db.get(getMovieDetailQuery);
  response.send(ConvertMovieDbAPI3(getResultMovie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;
  const deleteRequest = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director;`;
  const getDirectorsQueryResponse = await db.all(getDirectorsQuery);
  response.send(
    getDirectorsQueryResponse.map((eachItem) => convertDirectorDbAPI6(eachItem))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `select movie_name as movieName from movie where 
  director_id = ${directorId};`;
  const getMoviesByDirectorQueryResponse = await db.all(
    getMoviesByDirectorQuery
  );
  response.send(getMoviesByDirectorQueryResponse);
});

module.exports = app;
