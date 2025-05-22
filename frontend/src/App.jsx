import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const App = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [emojiStates, setEmojiStates] = useState([false, false, false]);
  const [result, setResult] = useState(null);
  const [dots, setDots] = useState("");
  const [finalEmoji, setFinalEmoji] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvStats, setCsvStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const emojis = ["😇", "😈", "😐"];
  const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyzeUniversal = async () => {
    setResult(null);
    setCsvStats(null);
    setLoading(true);

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const res = await fetch("http://localhost:8000/upload-file", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.error) {
          setResult(`Ошибка: ${data.error}`);
        } else {
          const formatted = Object.entries(data).map(([name, value]) => ({
            name,
            value,
          }));
          setCsvStats(formatted);
          setResult("Файл успешно проанализирован.");
        }
      } catch (err) {
        console.error("Ошибка при анализе файла:", err);
        setResult("Ошибка при анализе файла.");
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      const sentiment = data.sentiment.toLowerCase();
      let sentimentIndex = 2;
      if (sentiment.includes("полож")) sentimentIndex = 0;
      else if (sentiment.includes("негатив")) sentimentIndex = 1;

      const sentimentResult = `${data.sentiment} отзыв`;

      let cycleIndex = 0;
      const interval = setInterval(() => {
        setEmojiStates(emojis.map((_, i) => i === cycleIndex % emojis.length));
        cycleIndex++;
        if (cycleIndex >= 12) {
          clearInterval(interval);
          setEmojiStates(emojis.map((_, i) => i === sentimentIndex));
          setFinalEmoji(sentimentIndex);
          setResult(sentimentResult);
          setLoading(false);
        }
      }, 150);
    } catch (err) {
      console.error("Ошибка анализа:", err);
      setResult("Ошибка при анализе отзыва.");
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult(null);
    setCsvStats(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setCsvStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchDashboard = async () => {
    let url = "http://localhost:8000/dashboard";
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += "?" + params.join("&");

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setDashboardStats([]);
        setResult(`Ошибка: ${data.error}`);
      } else {
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки дашборда:", err);
    }
  };

  return (
    <div className="app">
      <motion.button
        className="help-button"
        onClick={() => setShowHelp(!showHelp)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ?
      </motion.button>

      <motion.div
        className={`help-panel ${showHelp ? "active" : ""}`}
        initial={false}
        animate={showHelp ? "visible" : "hidden"}
        variants={{
          visible: { opacity: 1, scale: 1 },
          hidden: { opacity: 0, scale: 0.8 },
        }}
        transition={{ duration: 0.3 }}
      >
        <h3>Инструкция по интерфейсу</h3>
        <ol>
          <li>Введите текст или загрузите файл.</li>
          <li>Нажмите "Анализировать".</li>
          <li>Дождитесь результата.</li>
          <li>Если вы хотите более подробной статистики по своему файлу запросу, можете открыть дашборд.</li>
        </ol>
      </motion.div>

      <h1 className="title animated-gradient">SENTIMENT ANALYZER</h1>

      <div className="emoji-container">
        {emojis.map((emoji, index) => (
          <motion.span
            key={index}
            className="emoji"
            animate={{
              opacity: emojiStates[index] ? 1 : 0.3,
              scale: emojiStates[index] ? 1.6 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <div className="input-wrapper">
        <textarea
          className="input-box"
          placeholder="Введите отзыв или загрузите файл"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!!selectedFile}
        />
        <label className="attach-label" title="Загрузить файл (.csv, .xlsx)">
          📎
          <input
            type="file"
            accept=".csv,.xlsx"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {selectedFile && (
        <div className="file-info">
          <span>{selectedFile.name}</span>
          <button className="remove-button" onClick={handleFileRemove}>
            ✕
          </button>
        </div>
      )}

      <motion.button
        className="analyze-button"
        onClick={handleAnalyzeUniversal}
        disabled={loading || (!text && !selectedFile)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? `Анализ${dots}` : "Анализировать"}
      </motion.button>

      {result && (
        <motion.div
          className="result"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <strong>Результат:</strong> {result}
        </motion.div>
      )}

      {csvStats && (
        <div className="chart-wrapper">
          <h2>Статистика по файлу</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={csvStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {csvStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="dashboard-toggle">
        <button
          className="analyze-button"
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? "Скрыть дашборд" : "Открыть дашборд"}
        </button>

        {showDashboard && (
          <>
            <h2>📊 Дашборд</h2>
            <div className="dashboard-controls">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button onClick={fetchDashboard}>Загрузить дашборд</button>
            </div>

            {dashboardStats.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardStats}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Положительный"
                    stroke="#00C49F"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Негативный"
                    stroke="#FF8042"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Нейтральный"
                    stroke="#FFBB28"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
