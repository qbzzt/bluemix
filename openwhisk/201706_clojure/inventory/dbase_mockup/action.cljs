(ns action.core)


(def dbase {
  "T-shirt XL" 10
  "T-shirt L" 50
  "T-shirt M" 0
  "T-shirt S" 12
  "T-shirt XS" 0
  })


 (.log js/console dbase)

(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      action (get cljParams "action")
      data (get cljParams "data")
    ]

    (case action
      "getAll" {"data" dbase}
      "getAvailable" {"data" (into {} (filter #(> (nth % 1) 0) dbase))}
      "processCorrection" (def dbase (into dbase data))
      "processPurchase" (def dbase (merge-with #(- %1 %2) dbase data))
      "processReorder" (def dbase (merge-with #(+ %1 %2) dbase data))
      {"error" "Unknown action"}
    )
  )
)
