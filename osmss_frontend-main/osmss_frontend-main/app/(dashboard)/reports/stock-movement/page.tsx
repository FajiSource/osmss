"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import apiService from "@/components/services/apiService";
import { Document, Page, Image, View, Text, renderToFile, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 800,
    width: "100%",
    textAlign: "center"
  },
  text: {
    fontSize: 12,
  },
  chartImage: {
    width: 800,
    height: "auto",
    marginBottom: "60px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    objectFit: "contain",
  },
});



export default function StockMovementReport() {
  const [data, setData] = useState(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState(null);
  const [itemName,setItemName] = useState([]);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: {
      day: "01",
      month: "01",
      year: "2024",
    },
    endDate: {
      day: "01",
      month: "01",
      year: "2024",
    },
    item: "Ballpoint Pens",
    chartType: "line",
    exportType: "pdf",
  })
  const MyDocument = ({ chartImage }: { chartImage: string }) => (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>OFFICE SUPPLIES STOCK MONITORING SYSTEM</Text>
          <Text style={styles.heading2}>STOCK MOVEMENT REPORT</Text>
          {/* <Text style={styles.subheading}>Chart:</Text> */}
          <Image style={styles.chartImage} src={chartImage} />
          <Text style={styles.subheading}>Start Date: {`${formData.startDate.year}/${formData.startDate.month}/${formData.startDate.day}`}</Text>
          <Text style={styles.subheading}>End Date: {`${formData.endDate.year}/${formData.endDate.month}/${formData.endDate.day}`}</Text>
        </View>
      </Page>
    </Document>
  );
  const handleExport = () => {
   
    const ws = XLSX.utils.json_to_sheet(chartData || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "exported_data.xlsx");
};
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
          // setData(null);
          // setChartData(null);
          return { success: false, error: "Invalid Date" };
        }

        const res = await apiService.get('/stock-movemnt-report', {
          params: {
            startDate: `${formData.startDate.year}/${formData.startDate.month}/${formData.startDate.day}`,
            endDate: `${formData.endDate.year}/${formData.endDate.month}/${formData.endDate.day}`,
            item: formData.item,
          }
        });
        if (res.status !== 200) {
          return { success: false, error: res.data.message };
        }
        let formatedData = [] as any;
        const dataValues = res.data.records;
        console.log("data:: ", dataValues);
        setData(dataValues);
        for (const key in dataValues) {
          const vals = dataValues[key];
          formatedData.push({
            date: key,
            stock_in: vals['Stock In'],
            stock_out: vals['Stock Out']
          })
        }
        console.log("formatedData:: ", formatedData);
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

  const items = [
    { value: "Ballpoint Pens", label: "Ballpoint Pens" },
    { value: "long-bond-paper", label: "Long Bond Paper" },
    { value: "staples", label: "Staples" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Generating report with:", formData)
  }
  useEffect(() => {
    const get_items = async () => {
      try{
          const res = await apiService.get('/items-name');
          if(res.status != 200 ){
            return { success: false, error: "An unexpected error occurred" };
          }
          setItemName(res.data.names);
          // console.log(res.data.names)
      }catch(e){
        console.error("Error during get data:", e);
        return { success: false, error: "An unexpected error occurred" }; 
      }
    }
    get_items();
  },[]);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">GENERATE ITEM STOCK MOVEMENT REPORT</h2>
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
                  <Label className="text-sm font-semibold">Item</Label>
                  <Select value={formData.item} onValueChange={(value) => setFormData({ ...formData, item: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemName.map((item,index) => (
                        <SelectItem key={index + item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel">Excel</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              {/* <Button type="submit" className="bg-[#b12025] hover:bg-[#b12025]/90">
                Export
              </Button> */}
              {chartImage ? (
                <PDFDownloadLink
                  document={<MyDocument chartImage={chartImage} />}
                  fileName="low_stock_report.pdf"
                  style={{ backgroundColor: "#b12025", padding: "4px 10px", fontWeight: 600, color: "white", borderRadius: "3px" }}
                >
                  {({ loading }) => (loading ? 'Generating...' : 'Download')}
                </PDFDownloadLink>
              ) : (
                <Button
                  type="button"
                  className="bg-[#b12025] hover:bg-[#b12025]/90"
                  onClick={formData.exportType === "excel" ? handleExport :  handleCaptureChart}
                >
                  Export
                </Button>
              )}
            </div>
          </form>
        </div>
        <div className="bg-white w-auto h-auto p-3">
          <div ref={chartRef} >
            {data && formData.chartType != "table" && (
              <ResponsiveContainer width="60%" height={600}>
                {formData.chartType === "line" ? (
                  <LineChart data={chartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* {Object.keys(chartData || {})?.map((key: string) => {
                    if (key !== "date") {

                      return (
                        <Line
                          key="value"
                          type="monotone"
                          dataKey="value"
                          stroke={"#191970"}
                          activeDot={{ r: 8 }}
                          name="Stock"
                        />
                      );
                    }
                    return null;
                  })} */}
                    <Line
                      key="stock_in"
                      type="monotone"
                      dataKey="stock_in"
                      stroke={"#00BFFF"}
                      activeDot={{ r: 8 }}
                      name="Stock In"
                    />
                    <Line
                      key="stock_out"
                      type="monotone"
                      dataKey="stock_out"
                      stroke={"#318CE7"}
                      activeDot={{ r: 8 }}
                      name="Stock Out"
                    />
                  </LineChart>
                ) : formData.chartType === "bar" ? (
                  <BarChart data={chartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* {Object.keys(chartData || {})?.map((key: string) => {
                    if (key !== "date") {
                      return (
                        <Bar
                          key="value"
                          dataKey="value"
                          fill={"#191970"}
                          name="Stock"
                        />
                      );
                    }
                    return null;
                  })} */}

                    <Bar
                      key="stock_in"
                      dataKey="stock_in"
                      fill={"#00BFFF"}
                      name="Stock In"
                    />
                    <Bar
                      key="stock_out"
                      dataKey="stock_out"
                      fill={"#318CE7"}
                      name="Stock Out"
                    />
                  </BarChart>
                ) : (<></>)}
              </ResponsiveContainer>
            )}

            {chartData && formData.chartType === "table" && (
              <table className="min-w-[62%] bg-white border  border-gray-300 rounded-lg shadow-md overflow-hidden">
                <thead className="bg-[#00BFFF]">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Stock In</th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Stock Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chartData &&
                    chartData?.map((item, i) => {
                      return (
                        <tr key={`${item.date} + ${i}`} className="hover:bg-gray-50">
                          <td className="py-3 px-6 text-sm text-gray-700 font-medium">{item.date}</td>
                          <td className="py-3 px-6 text-sm text-gray-600">{item.stock_in}</td>
                          <td className="py-3 px-6 text-sm text-gray-600">{item.stock_out}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}

          </div>
        </div>
      </div>
      {/* {chartImage && (
        <PDFDownloadLink
          document={<MyDocument chartImage={chartImage} />}
          fileName="low_stock_report.pdf"
        >
          {({ loading }) => (loading ? 'Generating...' : 'Export as PDF')}
        </PDFDownloadLink>
      )} */}
    </div>
  )
}

