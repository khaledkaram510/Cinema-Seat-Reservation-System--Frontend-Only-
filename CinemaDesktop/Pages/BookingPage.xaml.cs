using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Media;

using CinemaDesktop.Ui;
using Microsoft.FSharp.Collections;
using Microsoft.FSharp.Core;

namespace CinemaDesktop.Pages
{
	public partial class BookingPage : Page
	{
		private readonly Dictionary<string, CinemaCore.CinemaState> _halls;

		private string? _currentHallId;
		private CinemaCore.CinemaState? _currentState;

		private List<SeatCell> _seatCells = new();

		public BookingPage(Dictionary<string, CinemaCore.CinemaState> halls, string? preferredHallId)
		{
			InitializeComponent();
			_halls = halls;
			LoadHalls(preferredHallId);
		}

		private void LoadHalls(string? preferredHallId)
		{
			HallCombo.ItemsSource = _halls.Keys.OrderBy(x => x).ToList();
			HallCombo.SelectedItem =
				preferredHallId != null && _halls.ContainsKey(preferredHallId)
				? preferredHallId
				: HallCombo.Items.Count > 0 ? HallCombo.Items[0] : null;
		}

		private void Refresh_Click(object sender, RoutedEventArgs e)
		{
			LoadHalls(_currentHallId);
		}

		private void HallCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
		{
			StatusText.Text = "";

			_currentHallId = HallCombo.SelectedItem?.ToString();
			if (_currentHallId == null) return;

			_currentState = _halls[_currentHallId];
			RenderSeats();
		}

		private void RenderSeats()
		{
			if (_currentState == null || _currentHallId == null) return;

			int rows = _currentState.Rows;
			int cols = _currentState.SeatsPerRow;

			HallInfoText.Text = $"Hall: {_currentHallId} | Rows: {rows} | Seats/Row: {cols}";

			SeatsGrid.Rows = rows;
			SeatsGrid.Columns = cols;
			SeatsGrid.Children.Clear();

			_seatCells = new List<SeatCell>();

			for (int r = 1; r <= rows; r++)
			{
				for (int c = 1; c <= cols; c++)
				{
					var cell = new SeatCell(r, c);
					var pos = new CinemaCore.SeatPosition(r, c);

					var seatOpt = CinemaCore.SeatLayout.getSeatState(_currentState, pos);
					if (seatOpt != null && seatOpt.Value == CinemaCore.SeatState.Booked)
						cell.IsBooked = true;

					_seatCells.Add(cell);

					var btn = new ToggleButton
					{
						Content = $"{r}-{c}",
						Style = (Style)Resources["SeatToggleStyle"],
						IsEnabled = true,
						Tag = cell
					};

					if (cell.IsBooked)
					{
						btn.Background = Brushes.DarkRed;
						btn.BorderBrush = Brushes.IndianRed;
						btn.Opacity = 0.85;
					}

					btn.Click += Seat_Click;
					SeatsGrid.Children.Add(btn);
				}
			}
		}

		private void Seat_Click(object sender, RoutedEventArgs e)
		{
			if (sender is not ToggleButton btn) return;
			if (btn.Tag is not SeatCell cell) return;

			if (cell.IsBooked)
			{
				btn.IsChecked = false;
				MessageBox.Show(
					$"Seat {cell.Row}-{cell.Number} is already booked.",
					"Seat Unavailable",
					MessageBoxButton.OK,
					MessageBoxImage.Warning
				);
				return;
			}

			cell.IsSelected = btn.IsChecked == true;
		}

		private void Clear_Click(object sender, RoutedEventArgs e)
		{
			foreach (ToggleButton t in SeatsGrid.Children)
			{
				if (t.Tag is SeatCell cell && !cell.IsBooked)
					t.IsChecked = false;
			}

			foreach (var cell in _seatCells)
				cell.IsSelected = false;

			StatusText.Text = "Selection cleared.";
		}

		private void Book_Click(object sender, RoutedEventArgs e)
		{
			if (_currentHallId == null || _currentState == null)
			{
				StatusText.Text = "No hall selected.";
				return;
			}

			var selected = _seatCells.Where(s => s.IsSelected).ToList();
			if (!selected.Any())
			{
				StatusText.Text = "Please select at least one seat.";
				return;
			}

			var positions = selected.Select(s => new CinemaCore.SeatPosition(s.Row, s.Number));
			var fsharpList = ListModule.OfSeq(positions);

			var dto = CinemaCore.Cinema.bookSeatsDto(_currentState, fsharpList);
			if (!dto.IsSuccess)
			{
				StatusText.Text = dto.Error;
				return;
			}

			_currentState = dto.NewState;
			_halls[_currentHallId] = _currentState;

			string ticketText = CinemaCore.Cinema.formatTicket(dto.Ticket);
			SaveTicketToFile(_currentHallId, dto.Ticket, ticketText);

			StatusText.Text = "🎟 BOOKING SUCCESSFUL\n\n" + ticketText;
			RenderSeats();
		}

		private void SaveTicketToFile(string hallId, CinemaCore.Ticket ticket, string text)
		{
			var dir = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tickets");
			System.IO.Directory.CreateDirectory(dir);

			string ticketId = ticket.Id.Item;
			var path = System.IO.Path.Combine(dir, $"{hallId}_{ticketId}.txt");

			System.IO.File.WriteAllText(path, text);
		}
	}
}
