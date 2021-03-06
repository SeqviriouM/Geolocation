 var data=[]; // Содержит всю введенную информацию по маршруту
    var final_route = [];
    final_route[0] = "";

    // Функция сохранения текущей карточки и подготовка к вводу новой
    function save() {
      
      var trip = {}; // Содержит текущий отрезок
      var result_check; // Содержит результат проверки
      var from = document.getElementById("from").value.trim(); // Получение точки отправления
      var to = document.getElementById("to").value.trim(); // Получение точки прибытия
      var info_route = {}; // Содержит информацию о текущем отрезке пути
      var property=""; // Переменная для хранения промежуточного значения имени свойства
      var transport = document.form.transport.value; // Получение вида транспорта

      // Если выбран пункт "Другой транспорт", то считать имя транспорта из текстового поля
      if (transport === "another") {
          transport = document.getElementById("another_transport").value;
      }

      // Если значение в графе Транспорт - непустое, то сохранить его
      if (transport !== "") {
        trip["transport"] = transport;
      }

      // Получение div с id=dop_info
      var div = document.getElementById("dop_info");
      // Получение всех элементов input входящих в этот div
      var elems = div.getElementsByTagName('input');

      // Перебор этих элемнтов и, в случае необходимости, добалвение информации по маршруту в объект текущего отрезка пути
      for(var i=0; i<elems.length; i++) {
        if (elems[i].value !== "") {
          property = elems[i].value;
          i++;
          if (elems[i].value !== "") {
            trip[property] = elems[i].value;
          } 
          property = "";
        } else {
          i++;
        }
      }
      

      // Проверка на ввод пустого места отправления    
      if (from === "") {
        alert("Ошибка. Вы забыли заполнить поле 'Место отправления'");
        return;
      }

      // Проверка на ввод пустого места прибытия
      if (to === "") {
        alert("Ошибка. Вы забыли заполнить поле 'Место прибытия'");
        return;
      }

      trip["from"] = from;
      trip["to"] = to;
        
      data.push(trip); // Добавление к информации по маршруту введенного отрезка

      // Очищение формы
      document.getElementById("form").reset();
    }

    function next() {
      
      console.log(data);

      var kol_gorod = {}; // Содержит кол-во встречаемости каждого города.
      var begin; // Начало маршрута
      var end; // Конец маршрута
      var result=[]; // Будет содержать конечное словесное описание маршрута
      var goroda = [[]]; // Хранит копию data
      
      
      // Определения кол-ва встречаемости городов. Каждый город должен быть упомянут дважды: как пункт отправления и как пункт прибытия, за исключения начального города и конечного города. 
      for (var i in data) {
        if (typeof kol_gorod[data[i].to] === "undefined") {
          kol_gorod[data[i].to] = 1;
        } else {
          kol_gorod[data[i].to]++;
        }

        if (typeof kol_gorod[data[i].from] === "undefined") {
          kol_gorod[data[i].from] = 1;
        } else {
          kol_gorod[data[i].from]++;
        } 
      }

      // Выполним проверку введенного маршрута
      var result_check = check_route(kol_gorod);

      // Если проверка вернула отрицательный результат(false), то выводит соответствующее сообщение об ошибке
      if(!result_check) {
        alert("При вводе маршрута допущена ошибка. Попробуйте ввести данные заново.");
        location.reload();
        return;
      }
      
      // Определяем какой из городов является началом, а какой концом
      data.forEach(function(item) {
        switch (item.from) {
          case result_check[0]:
            begin = result_check[0];
            end = result_check[1];
            break;
          case result_check[1]:
            begin = result_check[1];
            end = result_check[0];
            break;
        }
      });

      // Копируем массив data и начало движения чтобы дальше их обработать функцией draw_route()
      goroda[0].push(data.slice());
      goroda[0].push(begin);

      // Вызываем функцию отрисовки маршрута(т.е. перебираем все возможные варианты поездок)
      draw_route(goroda, true)

      // Из всего множества возможных маршрутов выбираем только подходящие, т.е. такие в которых задействованы все введенные города
      for (var i=0; i<final_route.length; i++) {
        if (final_route[i].split(";").length-1 !== data.length) {
          continue;
        } 
        result.push(final_route[i]);
      }

      if (result.length === 0) {
        alert("Извените, при вводе маршрута допущена ошибка. Попробуйте ввести маршрут заново.");
        location.reload();
      }
      console.log(result);
      show_route(result);
        
    }



    // Функция проверки корректности введенного маршрута
    function check_route(towns) {
      var kol = 0; // Кол-во городов, встречающихся нечетное кол-во раз(это должен быть город начала пути и город окончания путешествия)
      var lateral_position = []; // Содержит крайние позиции, т.е. начальную точку отправления и конечную точку прибытия
      var check = true; // Сообщает результат проверки. В случае корректного ввода маршрута check = true 
      var result=[]; // Будет содержать заключение проверки и вслучае успеха два крайних города
      var begin_town=""; // Содержит начальный город в отрезке маршрута

      // Проверка, что данный город в маршруте фигурирует четное число раза(кроме крайних позиций)
      for (var i in towns) {
        if(towns[i] % 2 === 0) {
          continue;
        } else {
          if (kol < 2) {
            lateral_position.push(i);
            kol++;
          } else {
            check = false;
          }
        }
      }

      if (lateral_position.length === 0) {
        check = false;
      }

      if (check) {        
        return lateral_position;
      } else {
        return false;
      }
    }



    // Функция отрисовки маршрута(по введенным городам перебирает все возможные варианты поездок)
    function draw_route(routes,change) {
      var find_goroda = []; // массив городов, значение from в которых равно first
      //var result = []; // Конечное словесное описание маршрута
      var delete_index = []; // Хранит индексы найденных городов, которые необходимо удалить из routes, как использованные
      var length; // Хранит текущую длину routes 

      length = routes.length; // Сохраняем текущую длину routes, т.к. дальше возможно изменение routes, а следовательно и его длины

      //Условие рекурсии: если были найдены новые города по маршруту
      if (!change) {
        return;
      } else {

        change = false; 
          
        for (var i = 0; i<length; i++) {

          find_goroda = [];

          routes[i][0].forEach(function(item,index) {
            if (item.from === routes[i][1]) {
              find_goroda.push(item);
              delete_index.push(index);
            }
          })

          // Если был найден возможный следующий город пути, то меняет значение переменной change на true
          if (find_goroda.length != 0) {
            change = true;
          }

          // Запоминаем текущий(пройденный уже) маршрут
          otrezok = final_route[i];
          // Запоминаем текущее состояние списка городов(т.к. дальше производится удаление использованных городов)
          help_routes = routes[i][0].slice();
          //Запоминаем начальный город в текущем отрезке, т.к. дальше он перезапишется и потеряется и в случае раздвоения пути запишется неправильный город(в ветви else в следующем цикле)
          begin_town = routes[i][1];

          for (var j = 0; j < find_goroda.length; j++) {
            if (j === 0) {
              final_route[i] += routes[i][1] + "-";
              routes[i][1] = find_goroda[j].to;
              routes[i][0].splice(delete_index.shift(),1);
              final_route[i] += find_goroda[j].to + ";";

            } else {
              routes.push([help_routes,find_goroda[j].to]);
              routes[routes.length-1][0].splice(delete_index.shift(),1);
              final_route.push(otrezok);
              final_route[final_route.length-1] += begin_town + "-" + find_goroda[j].to + ";";
            }
          }

        }
        
        // Вызываем повторно фунецию draw_route для определения следующего города.
        draw_route(routes,change);        
      }
    }

    // Функция, которая по найденному маршруту выдает пользователю всю необходимую информацию
    function show_route(routes) {
      $("#res_div_text").append('<div class="form-group"><label>Маршрут движения: </label><br><br><textarea id="result_text" rows="10" cols="55"></textarea></div>');

      document.getElementById("result_text").value = "";

      for (var i=0; i<routes.length; i++) {
        document.getElementById("result_text").value += "\n" + (i + 1) + "  variant: \n\n"; 
        var way = routes[i].split(";");

        for (var j=0; j<way.length-1; j++) {
          data.forEach(function(item) {
            if ((way[j].split("-")[0] === item.from) && (way[j].split("-")[1] === item.to)) {
              document.getElementById("result_text").value += (j + 1) + ". From " + item.from + " to " + item.to + " take following transport: ";
              if (typeof item.transport !== "undefined") {
                document.getElementById("result_text").value += item.transport + ". ";
              } else {
                document.getElementById("result_text").value += "ups, it's looks like we haven't information about your transport on this way. So you should find any form of transport."
              }
              for (var k in item) {
                if ((k != "from") && (k != "to") && (k != "transport")) {
                  document.getElementById("result_text").value += k + ": " + item[k] + ". "
                }
              }
              document.getElementById("result_text").value += "\n";
            
            }
          })
        }
      }
    }