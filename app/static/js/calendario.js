let currentDate = new Date();
let selectedDay = currentDate.getDate();
let selectedMonth = currentDate.getMonth();
const form = document.getElementById('birthdayForm');

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

//função para atualizar o display do mês selecionado no header do calendário
function updateSelectedMonthDisplay() {
  document.getElementById('selectedMonthName').textContent = 
    monthNames[selectedMonth].toUpperCase(); 

}
//função para mostrar o formulário de adicionar aniversário e esconder o botão "Add Birthday"
function mostrarFormulario() {
      form.style.display = 'block';
      document.getElementById('addBirthday').style.display = 'none';
      document.getElementById('showBirthdays').style.display = 'none';
    }
//função para esconder o formulário de adicionar aniversário e mostrar o botão "Add Birthday"
function esconderFormulario() {
        form.style.display = 'none';
        document.getElementById('addBirthday').style.display = 'block';
        document.getElementById('showBirthdays').style.display = 'block';
      }
//adiciona um event listener para o envio do formulário de adicionar aniversário
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita o envio do formulário
  const name = form.elements['fname'].value;
  const bday = form.elements['bday'].value; //string no formato YYYY/MM/DD
  
  try {
    const response = await fetch('/add_friends/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, birthday: bday })
    });
    const responseData = await response.json();
    if (response.ok) {
      alert('Birthday added successfully!');
      addBirthdayToCalandar(); // Atualiza a lista de aniversários no calendário
    } else {
      alert('Failed to add birthday: ' + responseData.detail); 
    }
  }
  catch (error) {
    alert('An error occurred. Please try again.');
  }
  esconderFormulario();
 
}); 
//função para obter a data atual (dia, mês e ano) a partir do objeto currentDate
function getCurrentDate() {
  return {
    day: currentDate.getDate(),
    month: currentDate.getMonth(),
    year: currentDate.getFullYear()
  };
}
//função para calcular o número de dias em um mês e o dia da semana do primeiro dia do mês
function getDaysInMonth(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);//primeiro dia
      const lastDay = new Date(year, month + 1, 0); //ultimo dia do mês
      const daysInMonth = lastDay.getDate(); //numero de dias do mês
      const startingDayOfWeek = firstDay.getDay(); // dia da semana do primeiro dia do mês (0-6)

      return { daysInMonth, startingDayOfWeek }; //dias no mes e dia da semana do primeiro dia do mês
    }
//função para adicionar os aniversários dos amigos ao calendário, marcando os dias correspondentes
async function addBirthdayToCalandar() {
	try {
	const response = await fetch('/friends', {
		method: 'GET'
	});
  if (response.ok) {
      const data = await response.json();
      //console.log("Friends data:", data);

      data.forEach(friend => {
        const birthday = new Date(friend.birthday);
        const month = birthday.getMonth();
        //como no javascript os meses vão de 0 - 11 e os dias de 0 - 30, eu adicionei 1 por que no meu código os dias vão de 1 - 31, então para comparar com os botões do calendário eu preciso adicionar 1
        const day = birthday.getDate()+1;
       
        const buttons = document.querySelectorAll('.calendar-day');
        buttons.forEach(button => {
          if (Number(button.dataset.day) === day && currentDate.getMonth() === month) {
            button.classList.add('birthday'); 
            }
      
          });
      });
    } else {alert('Failed to fetch friends data. Please try again.');}
    } catch (error) {alert('Error fetching friends data: ' + error.message);}
  };
//função para renderizar o calendário, criando os botões para cada dia do mês e aplicando as classes CSS apropriadas
function renderCalendar(){
    const {day, month, year} = getCurrentDate();
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const gridContainer = document.getElementById('calendarGridContainer');
    gridContainer.innerHTML = '';

    const dia_atual = new Date();
    const ano = dia_atual.getFullYear();
    const mes = dia_atual.getMonth();
    let calendar_days = "";
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    let dayCounter = 1 - startingDayOfWeek; //começa em 1, mas se o mês começar na quarta-feira (3), começamos em -2 para preencher os dias vazios antes do primeiro dia do mês
    for (let i = 0; i < totalCells; i++) {
        if (dayCounter < 1 || dayCounter > daysInMonth) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'calendar-day empty';
          gridContainer.appendChild(emptyCell);
        } else {
        const dia = dayCounter;
        const dayCell = document.createElement('button');
        dayCell.className = 'calendar-day';
        dayCell.textContent = dia;
        dayCell.setAttribute('data-day', dia);

        if (dia === dia_atual.getDate() && month === mes && year === ano) {
            //console.log("Highlighting today's date:", dia, month, year);
            //console.log("Current date object:", dia_atual);
            //muda a cor do dia atual para vermelho, usando a classe CSS .today

            dayCell.classList.add('today');
        }

        const dayOfWeek = new Date(year, month, dia).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayCell.classList.add('weekend');
          }
          gridContainer.appendChild(dayCell);
        }

        dayCounter++;
      }

      document.getElementById('footerInfo').textContent = 
        monthNames[month] + ' ' + year + ' • ' + daysInMonth + ' days';
      
      let weekdays = 0;
      let weekends = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dayOfWeek = new Date(year, month, d).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekends++;
        } else {
          weekdays++;
        }
      }
      
      document.getElementById('monthStats').textContent = 
        weekdays + ' weekdays • ' + weekends + ' weekend days';
      addBirthdayToCalandar(); // Atualiza a lista de aniversários no calendário
    };
//função para buscar o próximo aniversário mais próximo e exibir um alerta com o nome do amigo e a data do aniversário
async function nextBirthday() {
  try {
    const response = await fetch('/friends', {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      data.forEach(friend => {
        const birthday = new Date(friend.birthday);
        const hoje = new Date();
        birthday.setFullYear(hoje.getFullYear());
        if (birthday < hoje) {
          birthday.setFullYear(hoje.getFullYear() + 1);
        }
        friend.nextBirthday = birthday; 
      });
      data.sort((a, b) => a.nextBirthday - b.nextBirthday);
      const nextFriend = data[0]; 
      if (nextFriend) {
        birthday = new Date(nextFriend.nextBirthday);
        const month = birthday.getMonth() + 1;
        const day = birthday.getDate()+1;
        document.getElementById("showBirthdays").innerHTML = "Next birthday: " + nextFriend.name + " - " + day + "/" + month;
}
      
    } else {
      alert('Failed to fetch next birthday. Please try again.');
    }
  } catch (error) {
    alert('Error fetching next birthday: ' + error.message);
  }
}; 
//adiciona event listeners para os botões de navegação entre os meses, atualizando a data atual e renderizando o calendário novamente
document.getElementById('prevMonth').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      selectedDay = 1;
      selectedMonth = currentDate.getMonth();
      updateSelectedMonthDisplay();
      renderCalendar();

    });
//adiciona event listeners para os botões de navegação entre os meses, atualizando a data atual e renderizando o calendário novamente
document.getElementById('nextMonth').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      selectedDay = 1;
      selectedMonth = currentDate.getMonth();
      updateSelectedMonthDisplay();
      renderCalendar();
    });

// Initial render
renderCalendar();
updateSelectedMonthDisplay();
addBirthdayToCalandar();
nextBirthday();
