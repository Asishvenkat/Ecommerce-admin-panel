import "./featuredInfo.css";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";

export default function FeaturedInfo() {
  const [income, setIncome] = useState([]);
  const [sales, setSales] = useState([]);
  const [incomePerc, setIncomePerc] = useState(0);
  const [salesPerc, setSalesPerc] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeRes = await userRequest.get("orders/income");
        const salesRes = await userRequest.get("orders/sales");

        setIncome(incomeRes.data);
        setSales(salesRes.data);

        // Calculate income % change
        if (incomeRes.data.length >= 2) {
          const incomeChange =
            (incomeRes.data[1].total * 100) / incomeRes.data[0].total - 100;
          setIncomePerc(incomeChange);
        }

        // Calculate sales % change
        if (salesRes.data.length >= 2) {
          const salesChange =
            (salesRes.data[1].count * 100) / salesRes.data[0].count - 100;
          setSalesPerc(salesChange);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="featured">
      {/* Revenue Section */}
      <div className="featuredItem">
        <span className="featuredTitle">Revenue</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">₹{income[1]?.total || 0}</span>
          <span className="featuredMoneyRate">
            %{Math.floor(incomePerc)}
            {incomePerc < 0 ? (
              <ArrowDownwardIcon className="featuredIcon negative" />
            ) : (
              <ArrowUpwardIcon className="featuredIcon" />
            )}
          </span>
        </div>
        <span className="featuredSub">Compared to last month</span>
      </div>

      {/* Sales Section */}
      <div className="featuredItem">
        <span className="featuredTitle">Sales</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">{sales[1]?.count || 0} Orders</span>
          <span className="featuredMoneyRate">
            %{Math.floor(salesPerc)}
            {salesPerc < 0 ? (
              <ArrowDownwardIcon className="featuredIcon negative" />
            ) : (
              <ArrowUpwardIcon className="featuredIcon" />
            )}
          </span>
        </div>
        <span className="featuredSub">Compared to last month</span>
      </div>
    </div>
  );
}
