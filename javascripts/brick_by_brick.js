$(function() {
  function l() { console.log("!"); }

  var game = {
    board: [],
    $board: $("#board"),
    $row: $("<div />", { "class": "row" }),
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
      game.createFirstRow();
      game.createPieces();
      game.createEmptyRows();
    },
    createFirstRow: function() {
      var contents = [],
          freebies = $.trim(game.board.shift()).split("");
      contents.push("<span class=\"heading\">1</span>");
      for (var i = 0, len = freebies.length; i < len; i++) {
        contents.push("<span" + (freebies[i] === "=" ? " class=\"null\">" : ">") +
                      freebies[i] + "</span>");
      }
      game.$row.clone().html(contents.join("")).appendTo(game.$board);
    },
    createPieces: function() {
      var $piece = $("<div />", { "class": "piece" });

    },
    createEmptyRows: function() {
      var $piece = $("<div />", { "class": "piece" }).html((new Array(7)).join('<span></span>')),
          $row = (function() {
            var $r = game.$row.clone();
            for (var i = 0; i < 5; i++) {
              $r.append($piece.clone());
            }
            return $r;
          })();
      for (var i = 2; i < 16; i += 2) {
        $row.clone().prepend('<span class="heading">' + i + '<br />' + (i + 1) + '</span>')
          .appendTo(game.$board);
      }
    },
    init: function(filename) {
      game.loadFile(filename);
    }
  };
  game.init("puzzle_1.xml");
});
