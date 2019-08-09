const board_template = {
  bindEvents() {
    $("[data-id=back]").on("click", (e) => {
      e.preventDefault();
      history.go(-1);
    });
  },

  render(game_data) {
    $(document.body).html(`
    <header>
      <h1>${game_data.title}</h1>
      <h2>${game_data.hint}</h2>
      <a href="#" data-id="back">Back</a>
    </header>
    <div id="board">
      <div class="row heading">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>10</span>
        <span>11</span>
        <span>12</span>
        <span>13</span>
        <span>14</span>
        <span>15</span>
      </div>
    </div>

    <section id="hints">
      <article>
        <h1>Across</h1>
        <ol></ol>
      </article>
      <article>
        <h1>Down</h1>
        <ol></ol>
      </article>
    </section>

    <div id="pieces">
    </div>`);
    this.bindEvents();
  }
};

class Puzzle {
  constructor(puzzle_href) {
    var game = {
      board: [],
      $row: $("<div />", { "class": "row" }),
      $selected: null,
      loadFile: function(f) {
        return $.ajax({
          url: f,
          success: function(json) {
            game.data = json;
          }
        });
      },
      parse: function() {
        game.parseHints();
        game.parseRows();
      },
      parseHints: function() {
        const containers = {
          across: $("#hints article:eq(0) ol"),
          down: $("#hints article:eq(1) ol")
        }
        let hints;

        ["across", "down"].forEach(function(direction) {
          hints = game.data[direction].map(function(blob) {
            return `<li>${blob.join("<br />")}</li>`;
          });
          containers[direction].html(hints.join(""));
        });
      },
      parseRows: function() {
        game.board = game.data.board;
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
            if (!game.$pieces.find(".piece").length) {
              game.checkAnswers();
            }
          }
        }
      },
      collateAnswers: function() {
        const board_text = $.trim($board.text());
        let board_arr = [board_text.substring(0, 15)];

        board_text.substring(15).split(/(.{30})/).filter((s) => !!s).forEach((double_row) => {
          let r1 = "",
              r2 = "";

          double_row.split(/(.{3})/).filter((s) => !!s).forEach((trip, i) => {
            i % 2 ? r2 += trip : r1 += trip;
          });

          board_arr.push(r1)
          board_arr.push(r2);
        });

        let correct = true;

        this.data.board.forEach((row, i) => {
          if (row !== board_arr[i]) {
            console.log(`Incorrect. Line ${i} ${board_arr[i]} !== ${row}`);
            correct = false;
          }
        });

        return correct;
      },
      checkAnswers: function() {
        var complete = this.collateAnswers(),
            $board = game.$board.clone();

        $board.find(".heading").remove();
        game[(complete ? "" : "in") + "complete"]();
      },
      complete: function() {
        var $p = $("p.message");
        if (!$p.length) { $p = $("<p />", { "class": "message" }).prependTo(document.body); }
        $p.removeClass("incomplete").text("Complete!");
      },
      incomplete: function() {
        var $p = $("p.message");
        if (!$p.length) { $p = $("<p />", { "class": "message" }).prependTo(document.body); }
        $p.addClass("incomplete").text("You've got some misplaced pieces!");
      },
      init: function(filename) {
        this.loadFile(filename).done(() => {
          board_template.render(this.data);
          this.$board = $("#board");
          this.$pieces = $("#pieces");
          this.parse();
        });
      }
    };
    game.init(puzzle_href);
  }
}

export default Puzzle;
