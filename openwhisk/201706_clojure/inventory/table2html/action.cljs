(ns action.core (:require clojure.string))



(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      data (get cljParams "data")
      dataKeys (keys data)
      rowsAsList (map #(clojure.string/join ["<tr><td>" %
                                    "</td><td>" (get data %) "</td></tr>"])
                      dataKeys)
      rowsAsString (clojure.string/join rowsAsList)

    ]

    {"html" (clojure.string/join
        ["<table><tr><th>Item</th><th>Amt. in Stock</th></tr>"
        rowsAsString
        "</table>"
        ])
    }
  )
)
