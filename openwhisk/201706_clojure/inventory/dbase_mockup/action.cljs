(ns action.core)


(def dbase {
  "T-shirt XL" 10
  "T-shirt L" 50
  "T-shirt M" 0
  "T-shirt S" 12
  "T-shirt XS" 0
  })

(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      action (get cljParams "action")
      data (get cljParams "data")
    ]

    (case action
      "getAll" {"data" dbase}
      "getAvailable" {"data" (into {} (filter #(> (nth % 1) 0) dbase))}
      "processCorrection" (do
          (def dbase (into dbase data))
          {"data" dbase}
      )
      "processPurchase" (do
          (def dbase (merge-with #(- %1 %2) dbase data))
          {"data" dbase}
      )
      "processReorder" (do
          (def dbase (merge-with #(+ (cljs.reader/parse-int %1) (cljs.reader/parse-int %2)) dbase data))
          {"data" dbase}
      )
      {"error" "Unknown action"}
    )
  )
)
