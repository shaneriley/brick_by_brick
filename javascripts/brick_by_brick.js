$(function() {
  function l() { console.log("!"); }

  var game = {
    board: [],
    $board: $("#board"),
    loadFile: function(f) {
      $.get(f, function(xml) {
        game.$xml = $(xml);
        game.parse();
      });
    },
    parse: function() {
      game.parseHints();
      game.parseRows();
    },
    parseHints: function() {
      var $across = $("#hints article:eq(0) ol"),
          $down = $("#hints article:eq(1) ol"),
          hints;
      $.each(["across", "down"], function(i, v) {
        hints = [];
        game.$xml.find(v + " hints").each(function() {
          var li = "<li>";
          $(this).find("hint").each(function(q) {
            if (q) { li += "<br />"; }
            li += $(this).text();
          });
          hints.push(li + "</li>");
        });
        ($across.find("li").length) ? $down.html(hints.join("")) : $across.html(hints.join(""));
      });
    },
    parseRows: function() {
      game.board = game.$xml.find("board").text().split(",");
      $.each(game.board, function(k, v) {
        var $r = $("<div />", { "class": "row" }),
            contents = [];
        v = $.trim(v).split("");
        contents.push("<span class=\"heading\">" + (k + 1) + "</span>");
        for (var i = 0, len = v.length; i < len; i++) {
          contents.push("<span" + (v[i] === "=" ? " class=\"null\">" : ">") +
                        v[i] + "</span>");
        }
        $r.html(contents.join("")).appendTo(game.$board);
      });
    },
    init: function(filename) {
      game.loadFile(filename);
    }
  };
  game.init("puzzle_1.xml");
});
