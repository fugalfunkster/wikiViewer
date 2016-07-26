$(function() {

  // autocompleter
  $('#inputField').autocomplete({
    source: function(query, done) {
      $.ajax({
        url: "http://en.wikipedia.org/w/api.php",
        dataType: 'jsonp',
        data: {
          'action': "opensearch",
          'format': "json",
          'search': query.term
        },
        success: function(data) {
          done(data[1]);
        }
      });
    },
  });

  // generate a random article
  $('#random').on('click', function(e) {
    //remove any previous article entries
    e.preventDefault();
    $('.article').remove();

    //request a random entry data
    $.ajax({
      url: "https://en.wikipedia.org//w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1",
      dataType: 'jsonp',
      type: 'POST',
      headers: {
        'Api-User-Agent': 'Example/1.0'
      },
      success: function(data) {

        //console.log(data);
        data.title = data.query.random[0].title;
        data.link = "https://en.wikipedia.org/wiki/" + data.title.split(" ").join("_");

        // compile template
        var source = $("#entry-template").html();
        var template = Handlebars.compile(source);
        $('.dangling').append(template(data));
      }
    });
  });

  // generate a list of 10 articles matching a search
  $('#searchForm').on('submit', function(e) {

    //remove any previous article entries
    e.preventDefault();
    $('.article').remove();

    //grab search params
    var query = $('input:text').val();

    //request 10 entries based on the search params
    $.ajax({
      url: "https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&format=json&srsearch=" + query + "&srlimit=10&prop=links",
      dataType: 'jsonp',
      type: 'POST',
      headers: {
        'Api-User-Agent': 'Example/1.0'
      },
      success: function(data) {

        //console.log(data);
        data = data.query.search;
        // for each entry returned, render the template using data from that entry
        data.forEach(function(each) {

          $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exlimit=1&explaintext=&indexpageids=&titles=" + each.title,
            dataType: 'jsonp',
            type: 'POST',
            headers: {
              'Api-User-Agent': 'Example/1.0'
            },
            success: function(eachData) {

              //console.log(eachData);
              //massage entry's text field for template
              var id = eachData.query.pageids[0];
              var text = eachData.query.pages[id].extract;
              text = text.substring(0, 140) + "...";

              //format data for template
              var obj = {
                title: eachData.query.pages[id].title,
                link: "https://en.wikipedia.org/wiki/" + each.title.split(" ").join("_"),
                text: text
              }

              // render template
              var source = $("#entry-template").html();
              var template = Handlebars.compile(source);
              $('.dangling').append(template(obj));

            }
          });
        });
      }
    });
  });
});
