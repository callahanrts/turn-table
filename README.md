# Turn Table

## TODO
- Add dialog that pops up when there will be a duplicate added to a playlist

- Add a loading dialog during track search/import
- Make searching/importing respond to enter/search button

- Figure out how to let youtube videos start playing while the tab is inactive. Soundcloud
  can do it so why can't youtube?

- Add an error messaging system that tells users when something goes wrong (ie. Lea
  wasn't sure why it kept only playing my songs, but she didn't have an active playlist).
  It should tell people "Hey! You were skipped because you don't have an active playlist!"

- Sometimes the room doesn't update avatars when someone joins the room (or lea's hamburger avatar
  is not loading the standing gif?)


## Structure (from meteor)

http://guide.meteor.com/structure.html

```
imports/
  startup/
    client/
      index.js                 # import client startup through a single index entry point
      routes.js                # set up all routes in the app
      useraccounts-configuration.js # configure login templates
    server/
      fixtures.js              # fill the DB with example data on startup
      index.js                 # import server startup through a single index entry point

  api/
    lists/                     # a unit of domain logic
      server/
        publications.js        # all list-related publications
        publications.tests.js  # tests for the list publications
      lists.js                 # definition of the Lists collection
      lists.tests.js           # tests for the behavior of that collection
      methods.js               # methods related to lists
      methods.tests.js         # tests for those methods

  ui/
    components/                # all reusable components in the application
                               # can be split by domain if there are many
    layouts/                   # wrapper components for behaviour and visuals
    pages/                     # entry points for rendering used by the router

client/
  main.js                      # client entry point, imports all client code

server/
  main.js                      # server entry point, imports all server code
```
