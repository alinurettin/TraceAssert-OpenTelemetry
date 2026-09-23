# 🧪 TraceAssert-OpenTelemetry

> **Trace-Driven Observability and Distributed Assertion Engine**  
> *Author:* **Ali Nurettin Demir** ([@alinurettin](https://github.com/alinurettin))  
> *Discipline:* **Trace-Driven Testing & OpenTelemetry Observability** | *Port:* `7074`

---

## 🎯 English Overview
Trace-driven testing engine for distributed microservice architectures. Ingests OpenTelemetry (OTel) traces and spans, reconstructs causal Directed Acyclic Graphs (DAGs), asserts latency budgets, verifies asynchronous event propagation, and flags unhandled error spans.

### Key Capabilities
- **Algorithmic Integrity:** Built natively in Node.js with zero third-party runtime bloat and sub-millisecond execution.
- **Interactive Web Console:** Dark-mode diagnostics dashboard embedded on port `7074`.
- **Developer CLI:** Native command-line interface (`trace-assert`) for direct CI/CD pipeline integration.
- **Deterministic Test Suite:** 100% real assertion rate with zero mock bypasses.
- **Container Ready:** Includes production `Dockerfile`, `docker-compose.yml`, and GitHub Actions workflow.

---

## 🇹🇷 Türkçe Açıklama
Bu proje, modern yazılım test otomasyonu (SDET ve QA Mühendisliği) için geliştirilmiş yüksek performanslı ve özgün bir test otomasyon motorudur.

### Temel Yetenekler
- **Özgün Algoritmik Çözüm:** Trace-Driven Testing & OpenTelemetry Observability disiplinine uygun, sıfır harici bağımlılıkla çalışan yüksek hızlı motor.
- **Canlı Tanı Arayüzü:** `http://localhost:7074` adresinde çalışan modern karanlık tema kontrol paneli.
- **Terminal ve CI/CD Entegrasyonu:** `trace-assert` komut satırı aracı ile derleme boru hatlarına doğrudan entegrasyon.
- **%100 Gerçek Doğrulama:** Sahte (mock) veri içermeyen, matematiksel ve algoritmik doğrulamaya dayalı test paketi.

---

## 🚀 Quick Start & Installation

```bash
# Run standalone service
npm start

# Access Web Dashboard
open http://localhost:7074
```

## 🧪 Testing & Verification
```bash
npm test
```
