$(function() {
  function l() { console.log("!"); }

  var game = {
    board: [],
    $board: $("#board"),
    $pieces: $("#pieces"),
    $row: $("<div />", { "class": "row" }),
    $selected: null,
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
      game.board = game.$xml.find("board").text().replace(/\s/g, "").split(",");
      game.createFirstRow();
      game.createPieces();
      game.createEmptyRows();
      game.attachEvents();
    },
    createFirstRow: function() {
      var contents = [],
          freebies = $.trim(game.board.shift()).split("");
      contents.push("<span class=\"heading\">1</span>");
      for (var i = 0, len = freebies.length; i < len; i++) {
        contents.push(game.createLetter(freebies[i]));
      }
      game.$row.clone().html(contents.join("")).appendTo(game.$board);
    },
    createLetter: function(c) {
      return "<span" + (c === "=" ? " class=\"null\">" : ">") + c + "</span>";
    },
    createPieces: function() {
      var $piece = $("<div />", { "class": "piece" }),
          pieces = [],
          s1, s2, rand;
      game.answers = [];
      for (var i = 0, len = game.board.length; i < game.board.length; i += 2) {
        game.answers.push([]);
        for (var j = 0; j < 5; j++) {
          var letters = [];
          s1 = game.board[i].substr(j * 3, 3);
          s2 = game.board[i + 1].substr(j * 3, 3);
          game.answers[i / 2].push(s1 + s2);
          $.each((s1 + s2).split(""), function(k, v) {
            letters.push(game.createLetter(v));
          });
          pieces.push($piece.clone().html(letters.join("")));
        }
      }
      pieces.sort(function() {
        return Math.round(Math.random()) - .5;
      });
      for (var q = 0, len = pieces.length; q < len; q++) {
        pieces[q].appendTo(game.$pieces);
      }
    },
    createEmptyPiece: function() {
      return $("<div />", { "class": "piece empty" }).html((new Array(7)).join('<span></span>'));
    },
    createEmptyRows: function() {
      var $piece = game.createEmptyPiece(),
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
    attachEvents: function() {
      var e = game.events;
      for (var m in e) {
        for (var v in e[m]) {
          if (v === "selector" || v === "parent") { continue; }
          $(e[m]["parent"]).delegate(e[m].selector, v, e[m][v]);
        }
      }
    },
    events: {
      clickPiece: {
        selector: ".piece",
        "parent": "#pieces",
        click: function() {
          var $p = $(this);
          if (!game.$selected) {
            game.$selected = $p.addClass("selected");
          }
          else {
            game.$selected.removeClass("selected");
            game.$selected = (game.$selected.is($p)) ? null : $p.addClass("selected");
          }
        }
      },
      doubleClickPiece: {
        selector: ".piece",
        "parent": "#board",
        dblclick: function() {
          var $p = $(this);
          if (!$p.hasClass("empty")) {
            game.createEmptyPiece().insertBefore($p);
            $p.appendTo(game.$pieces);
          }
        }
      },
      clickSpace: {
        selector: ".piece",
        "parent": "#board",
        click: function() {
          var $s = $(this);
          if (!game.$selected || !$s.hasClass("empty")) { return; }
          if (game.$selected.hasClass("selected")) {
            $s.replaceWith(game.$selected.removeClass("selected"));
          }
        }
      }
    },
    init: function(filename) {
      game.loadFile(filename);
    }
  };
  game.init("puzzle_1.xml");
});
