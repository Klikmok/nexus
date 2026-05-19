"""
NEXUS Validation Checklist v2.0
================================
Подробный чек-лист для валидации бизнес-идей по 19 критериям + анализ потока людей, аренды, логистики
"""

from dataclasses import dataclass
from typing import Optional

# ═════════════════════════════════════════════════════════════════════════════════
# CITY TIER CONFIGS — данные по городам разных тиров
# ═════════════════════════════════════════════════════════════════════════════════

CITY_TIER_CONFIG = {
    "1": {  # Москва, СПб
        "name": "Мегаполис",
        "avg_rent_per_sqm": 5000,  # руб/кв.м/мес
        "foot_traffic_multiplier": 1.5,
        "salary_multiplier": 1.4,
        "avg_check_multiplier": 1.4,
        "logistics_cost_multiplier": 1.1,
        "population": 10_000_000,
        "b2b_density_multiplier": 1.8,
        "competitor_count_multiplier": 2.0,
        "real_estate_availability": "high",
    },
    "2": {  # Краснодар, Казань, Новосибирск, Екатеринбург
        "name": "Крупный город",
        "avg_rent_per_sqm": 2500,
        "foot_traffic_multiplier": 1.0,
        "salary_multiplier": 1.0,
        "avg_check_multiplier": 1.0,
        "logistics_cost_multiplier": 1.0,
        "population": 1_500_000,
        "b2b_density_multiplier": 1.0,
        "competitor_count_multiplier": 1.0,
        "real_estate_availability": "medium",
    },
    "3": {  # Небольшие города, областные центры
        "name": "Региональный город",
        "avg_rent_per_sqm": 1200,
        "foot_traffic_multiplier": 0.6,
        "salary_multiplier": 0.8,
        "avg_check_multiplier": 0.8,
        "logistics_cost_multiplier": 1.2,
        "population": 200_000,
        "b2b_density_multiplier": 0.5,
        "competitor_count_multiplier": 0.4,
        "real_estate_availability": "low",
    },
}

# ═════════════════════════════════════════════════════════════════════════════════
# FOOT TRAFFIC ANALYZER
# ═════════════════════════════════════════════════════════════════════════════════


def analyze_foot_traffic(
    idea: dict,
    city_tier: str,
    business_type: list[str],
    format_type: str,
) -> dict:
    """
    Анализирует доступность потока людей для идеи.
    Возвращает: score (0-3), verdict (pass/warn/fail), warnings
    """
    warnings = []
    score = 0

    # Если идея онлайн — максимальный score
    if format_type == "online":
        return {"score": 3, "verdict": "pass", "warnings": [], "analysis": "Online формат — поток людей не критичен"}

    # Офлайн/гибрид — зависит от трафика
    foot_traffic_dep = idea.get("foot_traffic_dependent", False)
    if not foot_traffic_dep:
        return {"score": 3, "verdict": "pass", "warnings": [], "analysis": "Идея не зависит от потока пешеходов"}

    # Зависит от трафика — проверяем город
    city_tier_cfg = CITY_TIER_CONFIG.get(city_tier, CITY_TIER_CONFIG["2"])
    traffic_mult = city_tier_cfg["foot_traffic_multiplier"]

    # Базовый score в зависимости от тира
    if city_tier == "1":
        score = 3
        verdict = "pass"
    elif city_tier == "2":
        score = 3
        verdict = "pass"
    elif city_tier == "3":
        score = 2
        verdict = "warn"
        warnings.append(
            "Региональный город: поток пешеходов ниже среднего, требуется маркетинг")
    else:
        score = 1
        verdict = "fail"
        warnings.append(
            "Очень малый город: недостаточно потенциальных клиентов для офлайн-бизнеса")

    return {
        "score": score,
        "verdict": verdict,
        "warnings": warnings,
        "analysis": f"Город тир {city_tier}: поток людей {traffic_mult}x от среднего",
    }


# ═════════════════════════════════════════════════════════════════════════════════
# RENT AFFORDABILITY ANALYZER
# ═════════════════════════════════════════════════════════════════════════════════

def analyze_rent_affordability(
    idea: dict,
    capital: int,
    monthly_fixed: int,
    city_tier: str,
) -> dict:
    """
    Анализирует доступность аренды.
    Возвращает: score (0-3), verdict, warnings, estimated_rent
    """
    warnings = []
    score = 0
    estimated_rent = 0

    # Если офлайн не требуется — максимальный score
    if not idea.get("offline_required", False):
        return {
            "score": 3,
            "verdict": "pass",
            "warnings": [],
            "estimated_rent": 0,
            "analysis": "Офлайн не требуется или возможно работать из дома",
        }

    # Оценка площади (по умолчанию 30 кв.м для розницы, 50 для B2B)
    area = 30 if "B2C" in idea.get("market_analogues", []) else 50

    # Расчёт аренды в зависимости от тира
    city_cfg = CITY_TIER_CONFIG.get(city_tier, CITY_TIER_CONFIG["2"])
    rent_per_sqm = city_cfg["avg_rent_per_sqm"]
    estimated_rent = int(area * rent_per_sqm)

    # Проверка вписанности в бюджет
    # Правило: аренда должна быть ≤ 30% от месячного дохода или не более 15% капитала/12мес
    max_affordable_rent = max(
        capital // 12 * 0.15,  # 15% от капитала на 1 месяц
        monthly_fixed * 0.5,   # максимум 50% от фиксированных расходов
    )

    if estimated_rent > max_affordable_rent * 1.3:
        score = 0
        verdict = "fail"
        warnings.append(
            f"Аренда {estimated_rent} руб/мес недоступна при капитале {capital} и "
            f"фиксированных расходах {monthly_fixed} руб/мес"
        )
    elif estimated_rent > max_affordable_rent:
        score = 1
        verdict = "warn"
        warnings.append(
            f"Аренда {estimated_rent} руб/мес критична — очень напряжный бюджет"
        )
    elif estimated_rent > max_affordable_rent * 0.7:
        score = 2
        verdict = "warn"
        warnings.append(
            f"Аренда {estimated_rent} руб/мес — заметная доля бюджета")
    else:
        score = 3
        verdict = "pass"

    return {
        "score": score,
        "verdict": verdict,
        "warnings": warnings,
        "estimated_rent": estimated_rent,
        "max_affordable": int(max_affordable_rent),
        "analysis": f"Оценённая аренда: {estimated_rent} руб/мес (город тир {city_tier})",
    }


# ═════════════════════════════════════════════════════════════════════════════════
# LOGISTICS ANALYZER
# ═════════════════════════════════════════════════════════════════════════════════

def analyze_logistics(
    idea: dict,
    city_tier: str,
    capital: int,
) -> dict:
    """
    Анализирует сложность логистики и затраты на поставки.
    Возвращает: score (0-2), verdict, warnings, logistics_cost_monthly
    """
    warnings = []
    score = 0
    logistics_cost = 0

    complexity = idea.get("logistics_complexity", "low")
    city_cfg = CITY_TIER_CONFIG.get(city_tier, CITY_TIER_CONFIG["2"])
    logistics_mult = city_cfg["logistics_cost_multiplier"]

    base_monthly_costs = {
        "low": 5_000,      # простая доставка в своём городе
        "medium": 20_000,  # межрегиональная доставка
        "high": 50_000,    # сложная цепочка, импорт, множество поставщиков
    }

    logistics_cost = int(base_monthly_costs.get(
        complexity, 5_000) * logistics_mult)

    # Проверка по скору
    if complexity == "high":
        # Высокая сложность требует 10% капитала на логистику в месяц
        if logistics_cost > capital * 0.10:
            score = 0
            verdict = "fail"
            warnings.append(
                f"Логистика ({logistics_cost} руб/мес) невозможна при капитале {capital}"
            )
        else:
            score = 1
            verdict = "warn"
            warnings.append(
                "Сложная логистика требует постоянного мониторинга и резервов")
    elif complexity == "medium":
        if logistics_cost > capital * 0.08:
            score = 1
            verdict = "warn"
            warnings.append(
                f"Логистика {logistics_cost} руб/мес — в пределе доступного")
        else:
            score = 2
            verdict = "pass"
    else:  # low
        score = 2
        verdict = "pass"

    return {
        "score": score,
        "verdict": verdict,
        "warnings": warnings,
        "logistics_cost_monthly": logistics_cost,
        "logistics_complexity": complexity,
        "analysis": f"Логистика ({complexity}): {logistics_cost} руб/мес, город тир {city_tier}",
    }


# ═════════════════════════════════════════════════════════════════════════════════
# STARTUP COSTS BREAKDOWN
# ═════════════════════════════════════════════════════════════════════════════════

def analyze_startup_costs(
    idea: dict,
    capital: int,
    city_tier: str,
) -> dict:
    """
    Детальный анализ стартовых затрат.
    Возвращает: breakdown, warnings, verdict
    """
    warnings = []
    verdict = "pass"

    equipment = idea.get("estimated_capital_min", 0) * \
        0.6  # оборудование — 60%
    initial_inventory = idea.get(
        "estimated_capital_min", 0) * 0.2  # запасы — 20%
    preparation = idea.get("estimated_capital_min", 0) * \
        0.1  # ремонт, подготовка — 10%
    working_cap = idea.get("estimated_capital_min", 0) * \
        0.1  # оборотный капитал — 10%

    total_needed = equipment + initial_inventory + preparation + working_cap

    if total_needed > capital * 0.95:
        verdict = "fail"
        warnings.append(
            f"Стартовые затраты {int(total_needed)} руб требуют почти 100% капитала, "
            "не остаётся резерва для непредвиденного"
        )
    elif total_needed > capital * 0.80:
        verdict = "warn"
        warnings.append(
            f"Стартовые затраты {int(total_needed)} руб — очень напряжно, "
            "только 20% капитала останется подушкой"
        )

    breakdown = {
        "equipment": int(equipment),
        "initial_inventory": int(initial_inventory),
        "preparation": int(preparation),
        "working_capital": int(working_cap),
        "total": int(total_needed),
        "remaining_capital": int(capital - total_needed),
    }

    return {
        "breakdown": breakdown,
        "warnings": warnings,
        "verdict": verdict,
        "analysis": f"Оборудование: {int(equipment)}, Запасы: {int(initial_inventory)}, "
        f"Ремонт: {int(preparation)}, Оборот: {int(working_cap)}",
    }


# ═════════════════════════════════════════════════════════════════════════════════
# COMPREHENSIVE VALIDATION CHECKLIST
# ═════════════════════════════════════════════════════════════════════════════════

def validate_idea_comprehensive(idea: dict, profile: dict) -> dict:
    """
    Комплексная валидация идеи с анализом потока людей, аренды, логистики и затрат.
    """
    city_tier = profile.get("city_tier", "2")
    capital = int(profile.get("capital_range", "").split(
        "–")[0].replace("м", "000000").replace("к", "000") or 500_000)
    city = profile.get("city", "Москва")

    # 1. Анализ потока людей
    foot_traffic = analyze_foot_traffic(
        idea,
        city_tier,
        profile.get("business_type", []),
        profile.get("format", "online"),
    )

    # 2. Анализ доступности аренды
    rent = analyze_rent_affordability(
        idea,
        capital,
        idea.get("estimated_monthly_fixed", 0),
        city_tier,
    )

    # 3. Анализ логистики
    logistics = analyze_logistics(idea, city_tier, capital)

    # 4. Анализ стартовых затрат
    startup = analyze_startup_costs(idea, capital, city_tier)

    # 5. Определение проблем
    problems = []
    if foot_traffic["verdict"] == "fail":
        problems.extend([p for p in foot_traffic["warnings"]])
    if rent["verdict"] == "fail":
        problems.extend([p for p in rent["warnings"]])
    if logistics["verdict"] == "fail":
        problems.extend([p for p in logistics["warnings"]])
    if startup["verdict"] == "fail":
        problems.extend([p for p in startup["warnings"]])

    # 6. Итоговый вердикт по практическим факторам
    if problems:
        practical_verdict = "fail"
    elif any(v["verdict"] == "warn" for v in [foot_traffic, rent, logistics, startup]):
        practical_verdict = "warn"
    else:
        practical_verdict = "pass"

    return {
        "foot_traffic": foot_traffic,
        "rent_affordability": rent,
        "logistics": logistics,
        "startup_costs": startup,
        "practical_problems": problems,
        "practical_verdict": practical_verdict,
    }
