import { useTranslation } from "react-i18next";

function Landing() {
  const { t } = useTranslation();
  return <h2>{t("landing.title")}</h2>;
}
