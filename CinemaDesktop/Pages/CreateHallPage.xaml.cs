using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace CinemaDesktop.Pages
{
	public partial class CreateHallPage : Page
	{
		private readonly Dictionary<string, CinemaCore.CinemaState> _halls;
		private readonly Func<string> _getNextHallId;
		private readonly Action<string> _navigateToBooking;

		public CreateHallPage(
			Dictionary<string, CinemaCore.CinemaState> halls,
			Func<string> getNextHallId,
			Action<string> navigateToBooking)
		{
			InitializeComponent();
			_halls = halls;
			_getNextHallId = getNextHallId;
			_navigateToBooking = navigateToBooking;
		}

		private void CreateHall_Click(object sender, RoutedEventArgs e)
		{
			ErrorText.Text = "";
			ResultText.Text = "";

			if (!int.TryParse(RowsBox.Text, out int rows) || rows <= 0)
			{
				ErrorText.Text = "Rows must be a positive number.";
				return;
			}

			if (!int.TryParse(SeatsBox.Text, out int seatsPerRow) || seatsPerRow <= 0)
			{
				ErrorText.Text = "Seats per row must be a positive number.";
				return;
			}

			string hallId = _getNextHallId();

			// Call F# core: initCinema(hallId, rows, seatsPerRow)
			var state = CinemaCore.Cinema.initCinema(hallId, rows, seatsPerRow);

			_halls[hallId] = state;

			ResultText.Text = $"Created Hall {hallId} with {rows} rows and {seatsPerRow} seats per row.";

			// Go to booking page مباشرة (اختياري)
			_navigateToBooking(hallId);
		}
	}
}
