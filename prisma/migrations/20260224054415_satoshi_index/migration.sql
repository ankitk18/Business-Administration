-- CreateIndex
CREATE INDEX "employees_companyId_departmentId_idx" ON "employees"("companyId", "departmentId");

-- CreateIndex
CREATE INDEX "employees_companyId_departmentId_name_idx" ON "employees"("companyId", "departmentId", "name");
