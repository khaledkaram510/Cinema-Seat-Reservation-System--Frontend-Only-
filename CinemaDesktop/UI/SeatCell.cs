using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaDesktop.Ui
{
	public class SeatCell
	{
		public int Row { get; }
		public int Number { get; }
		public bool IsBooked { get; set; }
		public bool IsSelected { get; set; }

		public string Label => $"{Row}-{Number}";

		public SeatCell(int row, int number)
		{
			Row = row;
			Number = number;
		}
	}
}

