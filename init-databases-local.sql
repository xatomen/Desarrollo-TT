-- =====================================================
-- INICIALIZACIÓN DE BASES DE DATOS LOCALES
-- =====================================================

-- Crear bases de datos para cada API
CREATE DATABASE IF NOT EXISTS aach_db;
CREATE DATABASE IF NOT EXISTS carabineros_db;
CREATE DATABASE IF NOT EXISTS mtt_db;
CREATE DATABASE IF NOT EXISTS prt_db;
CREATE DATABASE IF NOT EXISTS sgd_db;
CREATE DATABASE IF NOT EXISTS sii_db;
CREATE DATABASE IF NOT EXISTS srcei_db;
CREATE DATABASE IF NOT EXISTS tgr_db;
CREATE DATABASE IF NOT EXISTS back_db;
CREATE DATABASE IF NOT EXISTS desarrollo_tt;

-- Asignar permisos completos a app_user en todas las bases de datos
GRANT ALL PRIVILEGES ON aach_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON carabineros_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON mtt_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON prt_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON sgd_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON sii_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON srcei_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON tgr_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON back_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON desarrollo_tt.* TO 'app_user'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;
