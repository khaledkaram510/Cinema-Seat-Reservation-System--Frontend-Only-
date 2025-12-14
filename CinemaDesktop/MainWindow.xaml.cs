using System.Collections.Generic;
using System.Windows;

namespace CinemaDesktop
{
	public partial class MainWindow : Window
	{
		// multi-halls store (UI state)
		private readonly Dictionary<string, CinemaCore.CinemaState> _halls = new();

		// auto hall id counter
		private int _nextHallNumber = 1;

		public MainWindow()
		{
			InitializeComponent();

			// start on Create Hall page
			MainFrame.Navigate(new Pages.CreateHallPage(_halls, GetNextHallId, NavigateToBooking));
		}

		private string GetNextHallId()
		{
			string id = $"H-{_nextHallNumber:0000}";
			_nextHallNumber++;
			return id;
		}

		private void NavigateToBooking(string? preferredHallId = null)
		{
			MainFrame.Navigate(new Pages.BookingPage(_halls, preferredHallId));
		}

		private void CreateHallNavBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new Pages.CreateHallPage(_halls, GetNextHallId, NavigateToBooking));
		}

		private void BookingNavBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new Pages.BookingPage(_halls, null));
		}
	}
}
