"use client"

import type React from "react"
import { Document, Page, Image, View, Text, renderToFile, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
// import ChartJsImage from 'chartjs-to-image';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import apiService from "@/components/services/apiService";

// const data = [
//   { date: '2023-01-01', itemA: 400, itemB: 200 },
//   { date: '2023-01-02', itemA: 300, itemB: 400 },
//   { date: '2023-01-03', itemA: 500, itemB: 300 },
//   { date: '2023-01-04', itemA: 600, itemB: 400 },
//   { date: '2023-01-05', itemA: 700, itemB: 500 },
// ];
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  heading2: {
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
    width: "100%"
  },
  heading: {
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
    width: "100%"
  },
  subheading: {
    fontSize: 16,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
  },
  chartImage: {
    width: 800,
    height: "auto",
    marginTop:"20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    objectFit: "contain",
  },
});



export default function LowStockReport() {
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [exportToPdf, setExportToPdf] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: {
      day: "01",
      month: "03",
      year: "2025",
    },
    endDate: {
      day: "26",
      month: "03",
      year: "2025",
    },
    threshold: "24",
    chartType: "line",
    exportType: "pdf",
  })
  const MyDocument = ({ chartImage }: { chartImage: string }) => (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>OFFICE SUPPLIES STOCK MONITORING SYSTEM</Text>
          <Text style={styles.heading2}>LOW STOCK REPORT</Text>
          {/* <Text style={styles.subheading}>Date Range: {`${formData.startDate.year}/${formData.startDate.month}/${formData.startDate.day}`} to {`${formData.endDate.year}/${formData.endDate.month}/${formData.endDate.day}`}</Text> */}
          {/* <Text style={styles.text}>Threshold: {formData.threshold}</Text> */}
          {/* <Text style={styles.subheading}>Chart:</Text> */}
          <Image style={styles.chartImage} src={chartImage} />
        </View>
      </Page>
    </Document>
  );
  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'chart.png';
        link.click();
      });
    }
  };
  const handleCaptureChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const imageUrl = canvas.toDataURL('image/png');
        setChartImage(imageUrl);
      });
    }
  };


  useEffect(() => {
    const get_data = async () => {
      try {
        //alert(`${formData.startDate.year}/${formData.startDate.month}/${formData.startDate.day}`);
        if (
          (String(formData.startDate.year).length !== 4 ||
            String(formData.startDate.month).length !== 2 ||
            String(formData.startDate.day).length !== 2) ||
          (String(formData.endDate.year).length !== 4 ||
            String(formData.endDate.month).length !== 2 ||
            String(formData.endDate.day).length !== 2)
        ) {
          setData(null);
          setChartData(null);
          return { success: false, error: "Invalid Date" };
        }

        const res = await apiService.get('/lowstock-report', {
          params: {
            start_date: `${formData.startDate.year}/${formData.startDate.month}/${formData.startDate.day}`,
            end_date: `${formData.endDate.year}/${formData.endDate.month}/${formData.endDate.day}`,
            threshold: formData.threshold
          }
        });
        if (res.status !== 200) {
          return { success: false, error: res.data.message };
        }
        let formatedData = [] as any;
        const data = res.data.supplies;
        setData(data);
        for (const key in data) {
          const vals = data[key];
          let value = {
            date: key
          };
          vals?.forEach((e: [string, any]) => {
            value = { ...value, [e[0]]: e[1] };
          });
          formatedData.push(value);
        }
        // console.log("formatedData:: ", formatedData);
        setChartData(formatedData);
        if (res.status !== 200) {
          return { success: false, error: res.data.message };
        }
        return res.data;
      } catch (e) {
        console.error("Error during get data:", e);
        return { success: false, error: "An unexpected error occurred" };
      }
    };
    get_data();
  }, [formData]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Generating report with:", formData)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">GENERATE LOW ITEM STOCK REPORT</h2>
        </div>

        <div className="bg-white mt-4 p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-x-24">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Select Date Range</Label>

                  <div className="space-y-2">

                    <Label className="text-sm">Start Date</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={formData.startDate.day}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: { ...formData.startDate, day: e.target.value },
                          })
                        }
                        className="w-16"
                        maxLength={2}
                      />
                      <Input
                        type="text"
                        value={formData.startDate.month}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: { ...formData.startDate, month: e.target.value },
                          })
                        }
                        className="w-16"
                        maxLength={2}
                      />
                      <Input
                        type="text"
                        value={formData.startDate.year}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: { ...formData.startDate, year: e.target.value },
                          })
                        }
                        className="w-20"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">End Date</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={formData.endDate.day}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: { ...formData.endDate, day: e.target.value },
                          })
                        }
                        className="w-16"
                        maxLength={2}
                      />
                      <Input
                        type="text"
                        value={formData.endDate.month}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: { ...formData.endDate, month: e.target.value },
                          })
                        }
                        className="w-16"
                        maxLength={2}
                      />
                      <Input
                        type="text"
                        value={formData.endDate.year}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: { ...formData.endDate, year: e.target.value },
                          })
                        }
                        className="w-20"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Select Chart Type</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Graph</Label>
                      <RadioGroup
                        value={formData.chartType}
                        onValueChange={(value) => setFormData({ ...formData, chartType: value })}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bar" id="bar" />
                          <Label htmlFor="bar">Bar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="line" id="line" />
                          <Label htmlFor="line">Line</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Table</Label>
                      <RadioGroup
                        value={formData.chartType}
                        onValueChange={(value) => setFormData({ ...formData, chartType: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="table" id="table" />
                          <Label htmlFor="table">Table</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stock Threshold</Label>
                  <Input
                    type="number"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Save report as</Label>
                  <RadioGroup
                    value={formData.exportType}
                    onValueChange={(value) => setFormData({ ...formData, exportType: value })}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf">PDF</Label>
                    </div>
                    {/* <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv">CSV</Label>
                    </div> */}
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline"
                onClick={() => setExportToPdf(false)}
              >
                Cancel
              </Button>
              {/* <Button type="submit" className="bg-[#b12025] hover:bg-[#b12025]/90"
                onClick={handleDownload}>
                Export
              </Button> */}


              {chartImage ? (
                <PDFDownloadLink
                  document={<MyDocument chartImage={chartImage} />}
                  fileName="low_stock_report.pdf"
                  style={{ backgroundColor: "#b12025", padding: "4px 10px",fontWeight: 600, color: "white", borderRadius: "3px" }}
                >
                  {({ loading }) => (loading ? 'Generating...' : 'Download')}
                </PDFDownloadLink>
              ) : (
                <Button
                  type="button"
                  className="bg-[#b12025] hover:bg-[#b12025]/90"
                  onClick={handleCaptureChart}  
                >
                  Export
                </Button>
              )}
            </div>

          </form>
        </div>
        <div ref={chartRef} >

          {chartData && formData.chartType != "table" && (
            <ResponsiveContainer width="60%" height={600}>
              {formData.chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(chartData[0] || {})?.map((key: string) => {
                    if (key !== "date") {
                      const randomColor = getRandomColor();
                      return (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={randomColor}
                          activeDot={{ r: 8 }}
                          name={key}
                        />
                      );
                    }
                    return null;
                  })}
                </LineChart>
              ) : formData.chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(chartData[0] || {})?.map((key: string) => {
                    if (key !== "date") {
                      return (
                        <Bar
                          key={key}
                          type="monotone"
                          dataKey={key}
                          fill="#00BFFF"
                          name={key}
                        />
                      );
                    }
                    return null;
                  })}
                </BarChart>
              ) : (<></>)}
            </ResponsiveContainer>
          )}
          {chartData && formData.chartType === "table" && (
            <table className="min-w-[62%] bg-white border  border-gray-300 rounded-lg shadow-md overflow-hidden">
              <thead className="bg-[#00BFFF]">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Item</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">No. Stack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data &&
                  Object.keys(data || {})?.map((date, i) => {
                    return data[date]?.map((item, j) => {
                      return (
                        <tr key={j} className="hover:bg-gray-50">
                          {j === 0 && (
                            <td rowSpan={data[date].length} className="py-3 px-6 text-sm text-gray-700 font-medium">{date}</td>
                          )}
                          {item.map((e, k) => {
                            return <td key={k} className="py-3 px-6 text-sm text-gray-600">{e}</td>;
                          })}
                        </tr>
                      );
                    });
                  })}
              </tbody>
            </table>
          )}


        </div>

      </div>
    </div>
  )
}

