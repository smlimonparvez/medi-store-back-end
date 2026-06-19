app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "MediStore API is running!" });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(globalErrorHandler);

export default app;