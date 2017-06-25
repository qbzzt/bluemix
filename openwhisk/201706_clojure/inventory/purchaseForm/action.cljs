(ns action.core (:require clojure.string))



(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      data (get cljParams "data")
      dataKeys (keys data)
      rowsAsList (map #(clojure.string/join ["<tr><td>" %
                                    	"</td><td>" (get data %) "</td>"
					"<td><input type=$$$number$$$ name=$$$" % "$$$></td>"
					"</tr>"])
                      dataKeys)
      rowsAsString (clojure.string/join rowsAsList)

    ]

    {"html" (clojure.string/join
        [
	"<form method=$$$post$$$>"
	"<table><tr><th>Item</th><th>Amt. in Stock</th><th>Purchase Amt.</th></tr>"
        rowsAsString
        "</table><br /><button type=$$$submit$$$>Submit</button>"
	"</form>"
        ])
    }
  )
)
