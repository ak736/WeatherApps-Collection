//
//  ToastView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 12/6/24.
//

import SwiftUI

struct ToastView: View {
    let message: String
    let isShowing: Bool
    
    var body: some View {
        VStack {
            Spacer()
            if isShowing {
                Text(message)
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.black.opacity(0.7))
                    .cornerRadius(8)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .padding(.bottom, 20)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: isShowing)
    }
}
