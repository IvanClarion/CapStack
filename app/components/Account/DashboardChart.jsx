import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const DashboardChart = () => {
  return (
    <View>
     <LineChart
  data={{
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        data: [1300, 1700, 1200, 1900],
      },
    ],
  }}
  width={Dimensions.get("window").width - 32}
  height={220}
  chartConfig={{
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 96, 96, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  }}
  bezier
  style={{
    marginVertical: 8,
    borderRadius: 16,
  }}
/>
    </View>
  );
};

export default DashboardChart;
