document.addEventListener('DOMContentLoaded', () => {
  const scheduleGrid = document.querySelector('.schedule-grid');
  const days = ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const reservaForm = document.getElementById('reserva-form');
  const selectedDay = document.getElementById('selected-day');
  const selectedTime = document.getElementById('selected-time');
  const btnReservar = document.getElementById('btn-reservar');
  const branches = document.querySelectorAll('.branch');

  if (branches.length > 0) {
    branches[0].classList.add('selected');
  }

  days.forEach(day => {
    const div = document.createElement('div');
    div.textContent = day;
    div.classList.add(day === 'Hora' ? 'time-label' : 'day-header');
    scheduleGrid.appendChild(div);
  });

  const startHour = 9;
  const endHour = 21;
  const turnoDuracion = 70;

  function formatTime(mins) {
    let h = Math.floor(mins / 60),
        m = mins % 60,
        ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  let currentMins = startHour * 60;
  const endMins = endHour * 60;

  while (currentMins + turnoDuracion <= endMins) {
    const timeLabel = document.createElement('div');
    timeLabel.classList.add('time-label');
    timeLabel.textContent = formatTime(currentMins);
    scheduleGrid.appendChild(timeLabel);

    for (let d = 1; d < days.length; d++) {
      const slot = document.createElement('div');
      slot.classList.add('slot');
      slot.dataset.day = days[d];
      slot.dataset.time = formatTime(currentMins);
      slot.dataset.status = 'Disponible';
      slot.textContent = 'Disponible';
      scheduleGrid.appendChild(slot);
    }

    currentMins += turnoDuracion;
  }

  let reservasGuardadas = JSON.parse(localStorage.getItem('reservas')) || [];
  reservasGuardadas.forEach(({ dia, hora }) => {
    document.querySelectorAll('.slot').forEach(slot => {
      if (slot.dataset.day === dia && slot.dataset.time === hora) {
        slot.dataset.status = 'Reservado';
        slot.textContent = 'Reservado';
        slot.classList.add('reservado');
      }
    });
  });

  const ultimaReserva = JSON.parse(localStorage.getItem('ultimaReserva'));
  if (ultimaReserva) {
    document.querySelectorAll('.slot').forEach(slot => {
      if (slot.dataset.day === ultimaReserva.dia && slot.dataset.time === ultimaReserva.hora) {
        slot.classList.add('selected');
        selectedDay.textContent = slot.dataset.day;
        selectedTime.textContent = slot.dataset.time;
        reservaForm.style.display = 'block';
      }
    });
    localStorage.removeItem('ultimaReserva');
  }

  scheduleGrid.addEventListener('click', e => {
    if (!e.target.classList.contains('slot')) return;
    if (e.target.dataset.status !== 'Disponible') {
      alert('Este turno ya está reservado.');
      return;
    }

    document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));
    e.target.classList.add('selected');

    selectedDay.textContent = e.target.dataset.day;
    selectedTime.textContent = e.target.dataset.time;
    reservaForm.style.display = 'block';

    localStorage.setItem('seleccionTurno', JSON.stringify({
      dia: e.target.dataset.day,
      hora: e.target.dataset.time
    }));
  });

  branches.forEach(branch => {
    branch.addEventListener('click', () => {
      branches.forEach(b => b.classList.remove('selected'));
      branch.classList.add('selected');
      document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));
      reservaForm.style.display = 'none';
      localStorage.removeItem('seleccionTurno');
    });
  });

  btnReservar.addEventListener('click', () => {
    const slotSeleccionado = document.querySelector('.slot.selected');
    if (!slotSeleccionado) {
      alert('Seleccione un turno antes de reservar.');
      return;
    }

    const dia = slotSeleccionado.dataset.day;
    const hora = slotSeleccionado.dataset.time;
    const sede = document.querySelector('.branch.selected')?.textContent || 'Ninguna';

    if (slotSeleccionado.dataset.status !== 'Disponible') {
      alert('Este turno ya está reservado.');
      return;
    }

    slotSeleccionado.dataset.status = 'Reservado';
    slotSeleccionado.textContent = 'Reservado';
    slotSeleccionado.classList.add('reservado');
    slotSeleccionado.classList.remove('selected');

    reservasGuardadas.push({ dia, hora });
    localStorage.setItem('reservas', JSON.stringify(reservasGuardadas));
    localStorage.setItem('ultimaReserva', JSON.stringify({ dia, hora }));
    localStorage.setItem('fechaCita', dia);
    localStorage.setItem('horaCita', hora);
    localStorage.setItem('sedeCita', sede);

    window.location.href = `confirmacion.html?dia=${dia}&hora=${hora}&sede=${sede}`;
  });

const btnLimpiar = document.getElementById('btn-limpiar');

btnLimpiar.addEventListener('click', () => {
  reservasGuardadas = [];
  localStorage.removeItem('reservas');
  localStorage.removeItem('ultimaReserva');
  localStorage.removeItem('fechaCita');
  localStorage.removeItem('horaCita');
  localStorage.removeItem('sedeCita');

  document.querySelectorAll('.slot.reservado').forEach(slot => {
    slot.dataset.status = 'Disponible';
    slot.textContent = 'Disponible';
    slot.classList.remove('reservado');
  });

  reservaForm.style.display = 'none';

  // ✅ Mensaje actualizado
  alert('Happy Group: Todas las reservas han sido borradas.');
});




});
